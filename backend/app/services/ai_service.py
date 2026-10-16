import json
import logging
import re
import time
from typing import AsyncGenerator, List, Dict, Any, Optional

from app.config import settings
from app.services.ai_agent_service import AIAgentService
from app.services.ai_cache_service import AICacheService
from app.services.ai_moderation_service import AIModerationService
from app.services.rag_service import RAGService

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are SIVORA's intelligent AI Stylist & Luxury Shopping Assistant.
Your goal is to guide shoppers, answer product questions, and provide personalized recommendations based exclusively on our store's catalog.

=== CATALOG CONTEXT ===
{context}
=======================

STRICT INSTRUCTIONS:
1. ONLY recommend products that are explicitly listed in the CATALOG CONTEXT above.
2. If the user asks for something not in our catalog, politely clarify that we do not currently carry it and suggest the closest available alternative from the context.
3. Include specific product names, accurate prices in Indian Rupees (₹), and key features.
4. Keep your tone enthusiastic, polite, professional, and concise.
5. End your recommendation with a clean bulleted summary citing the products you recommended.
"""

GREETING_SYSTEM_PROMPT = """You are SIVORA's personal AI Stylist and luxury shopping concierge.
The customer has greeted you or started a friendly conversation.
Respond warmly, politely, and elegantly (e.g., 'Hello! Welcome to SIVORA. How may I assist your style journey today?').
Politely ask them what occasion, outfit, or collection they are shopping for (Women, Men, Girls, or Boys).
Mention that you can help with sizing, live warehouse inventory checks, or applying discount code SAVE10 for 10% off.
Do NOT list specific products yet until they mention what they need.
"""

class AIService:
    """
    Day 21 AI Service:
    Manages multi-provider LLMs (Groq, Gemini), Fallback Strategy,
    Prompt Engineering, SSE Token Streaming, Content Moderation,
    Tool Calling integration, and Redis Caching.
    """

    @classmethod
    def build_prompt(cls, query: str, context: str, history: Optional[List[Dict[str, str]]] = None) -> List[Dict[str, str]]:
        system_content = SYSTEM_PROMPT_TEMPLATE.format(context=context)
        messages = [{"role": "system", "content": system_content}]

        # Append last 4 messages from conversation history for multi-turn context
        if history:
            for msg in history[-4:]:
                if msg.get("role") in ["user", "assistant"] and msg.get("content"):
                    messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": query})
        return messages

    @classmethod
    def _stream_groq(cls, messages: List[Dict[str, str]]) -> Any:
        from groq import Groq
        if not settings.GROQ_API_KEY:
            raise ValueError("Groq API key not configured")
        client = Groq(api_key=settings.GROQ_API_KEY)
        return client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=800,
            stream=True
        )

    @classmethod
    def _stream_gemini(cls, messages: List[Dict[str, str]]) -> Any:
        import google.generativeai as genai
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        # Flatten messages to prompt string for Gemini
        user_prompt = messages[-1]["content"]
        system_instruction = messages[0]["content"]
        full_prompt = f"{system_instruction}\n\nUser Question: {user_prompt}"

        return model.generate_content(full_prompt, stream=True)

    GREETING_REGEX = re.compile(
        r"^(hi|hey|hello|heyy|heya|hola|namaste|hlo|hii|hiii|hey\s+hi|hi\s+hey|hi\s+hello|hello\s+there|"
        r"good\s+(morning|afternoon|evening|day)|hi\s+sir|hello\s+sir|hey\s+sir|greetings)\b",
        re.IGNORECASE,
    )

    CONVERSATIONAL_REGEX = re.compile(
        r"^(who\s+are\s+you|what\s+can\s+you\s+do|how\s+can\s+you\s+help(\s+me)?|tell\s+me\s+about\s+yourself|"
        r"what\s+is\s+sivora|help|menu|start)\b",
        re.IGNORECASE,
    )

    PLEASANTRY_REGEX = re.compile(
        r"^(thanks|thank\s+you|thanks\s+a\s+lot|thx|bye|goodbye|see\s+you|ok|okay|cool|super|nice)\b",
        re.IGNORECASE,
    )

    FASHION_SEARCH_TERMS = [
        "saree", "sari", "kurta", "kurti", "shirt", "t-shirt", "tshirt", "pant", "pants", "jeans",
        "dress", "lehenga", "suit", "jacket", "hoodie", "top", "frock", "palazzo", "anarkali",
        "churidar", "dupatta", "blazer", "trousers", "joggers", "shorts", "wear", "outfit",
        "women", "men", "girl", "girls", "boy", "boys", "kid", "kids", "fabric", "cotton",
        "silk", "linen", "denim", "size", "price", "stock", "coupon", "discount", "offer",
        "buy", "order", "cost", "recommend", "show", "suggest", "looking for", "find", "search"
    ]

    @classmethod
    def is_conversational_greeting(cls, query: str) -> bool:
        clean = re.sub(r"[^\w\s]", " ", query.strip().lower())
        words = clean.split()
        if not words:
            return True

        query_clean = " ".join(words)

        is_greeting_match = bool(
            cls.GREETING_REGEX.search(query_clean)
            or cls.CONVERSATIONAL_REGEX.search(query_clean)
            or cls.PLEASANTRY_REGEX.search(query_clean)
        )

        if is_greeting_match:
            # If user explicitly asked for a fashion item in the same sentence (e.g. "hey show me sarees")
            has_fashion_intent = any(k in words for k in cls.FASHION_SEARCH_TERMS)
            if not has_fashion_intent:
                return True

        return False

    @classmethod
    def _tokenize_text(cls, text: str) -> List[str]:
        words = text.split(" ")
        tokens = []
        for i, word in enumerate(words):
            tokens.append(word + (" " if i < len(words) - 1 else ""))
        return tokens

    @classmethod
    def _generate_mock_stream(
        cls,
        query: str,
        context: str,
        sources: List[Dict[str, Any]],
        tools_executed: Optional[List[Dict[str, Any]]] = None,
        is_greeting: bool = False,
    ) -> List[str]:
        """
        Intelligent Local Fallback Provider:
        Generates realistic e-commerce concierge greetings or contextual recommendations
        grounded in the ChromaDB retrieved sources and executed application tools.
        """
        clean = re.sub(r"[^\w\s]", " ", query.strip().lower())
        query_strip = " ".join(clean.split())

        if is_greeting:
            if any(w in query_strip for w in ["thanks", "thank you", "cool", "super", "nice"]):
                text = (
                    "You are most welcome! ✨ Whenever you need bespoke styling advice, sizing guidance, "
                    "or outfit ideas for any occasion, I am always right here. Happy shopping at SIVORA!"
                )
            elif any(w in query_strip for w in ["bye", "goodbye", "see you"]):
                text = (
                    "Goodbye! Have a marvelous day, and we look forward to dressing your next bespoke look at SIVORA! ✨"
                )
            else:
                text = (
                    "Hello! Welcome to SIVORA Luxury Atelier. ✨\n\n"
                    "I am your personal AI Stylist and shopping assistant. How may I assist your style journey today?\n\n"
                    "Are you looking for any specific outfits or collections? For example:\n"
                    "• **Women's Collection**: Banarasi Silk Sarees, Designer Lehengas, Festive Anarkalis & Chic Tops\n"
                    "• **Men's Collection**: Pure Linen Shirts, Royal Heritage Kurtas, Chinos & Casual Tees\n"
                    "• **Girls & Boys Collections**: Party Twirl Frocks, Embroidered Sherwanis & Kurta Sets\n\n"
                    "You can also ask me to **check live inventory**, inquire about fabric details, or apply coupon code **SAVE10** for an exclusive 10% discount! 🎁\n\n"
                    "Which collection or style would you like to explore?"
                )
            return cls._tokenize_text(text)

        tool_intro = ""
        if tools_executed:
            tool_summaries = []
            for t in tools_executed:
                if t.get("tool") == "apply_coupon_calculator" and t.get("result", {}).get("valid"):
                    tool_summaries.append(
                        f"Applied coupon **{t['result']['coupon_code']}** for ₹{t['result']['discount_amount']:,.2f} discount!"
                    )
                elif t.get("tool") == "check_product_stock" and t.get("result", {}).get("found"):
                    tool_summaries.append(
                        f"Checked live inventory: **{t['result']['stock_quantity']} units in stock**!"
                    )
            if tool_summaries:
                tool_intro = " ℹ️ " + " | ".join(tool_summaries) + "\n\n"

        if not sources:
            text = (
                f"{tool_intro}Hello! Welcome to SIVORA. I searched our fashion catalog, but couldn't find exact matches "
                f"for '{query}'. You can browse our categories above or ask me to recommend our top luxury pieces!"
            )
        else:
            top_prod = sources[0]
            recommendations = []
            for s in sources[:3]:
                recommendations.append(
                    f"• **{s['name']}** ({s['category']}): ₹{s['price']:,.2f} — {s['stock']} in stock."
                )
            recs_text = "\n".join(recommendations)

            text = (
                f"{tool_intro}Based on our luxury collection, here are curated recommendations for **'{query}'**:\n\n"
                f"{recs_text}\n\n"
                f"Our top pick is the **{top_prod['name']}** at ₹{top_prod['price']:,.2f}. "
                "You can click 'Add' on any product card below to place it straight into your shopping bag. "
                "Use coupon code **SAVE10** at checkout for an exclusive 10% privilege discount! 🎁"
            )

        return cls._tokenize_text(text)

    @classmethod
    async def stream_chat(
        cls,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        db: Any = None
    ) -> AsyncGenerator[str, None]:
        """
        Server-Sent Events (SSE) generator:
        1. AI Content Moderation Check
        2. Greeting & Conversational Intent Recognition (No random product dumping on greetings)
        3. RAG Retrieval from ChromaDB with PostgreSQL live verification
        4. Agent Tool Calling Check (Stock, Coupons, Pricing)
        5. Multi-Provider Fallback (Groq -> Gemini -> Fallback)
        6. Token Streaming & Final Done Event
        """
        # 1. AI Content Moderation Check
        mod_result = AIModerationService.moderate_content(query, content_type="query")
        if not mod_result["is_safe"] and mod_result["status"] == "rejected":
            warning_msg = (
                "⚠️ **Safety Notice**: Your message was flagged for containing prohibited or sensitive content. "
                "Please adhere to our community guidelines so we can assist you."
            )
            yield f"data: {json.dumps({'type': 'token', 'content': warning_msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'provider': 'moderation-guardrail'})}\n\n"
            return

        # 2. Check for Greetings / Pleasantries
        is_greeting = cls.is_conversational_greeting(query)

        if is_greeting:
            # Yield empty sources so NO random product cards are displayed on greetings
            yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"

            provider_used = "mock"
            streamed_success = False

            greeting_messages = [
                {"role": "system", "content": GREETING_SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ]

            # Try Groq for dynamic greeting
            if settings.GROQ_API_KEY:
                try:
                    groq_stream = cls._stream_groq(greeting_messages)
                    for chunk in groq_stream:
                        delta = chunk.choices[0].delta.content or ""
                        if delta:
                            yield f"data: {json.dumps({'type': 'token', 'content': delta})}\n\n"
                    provider_used = "groq"
                    streamed_success = True
                except Exception as e:
                    logger.warning("Groq greeting failed (%s). Falling back...", e)

            # Try Gemini for dynamic greeting
            if not streamed_success and settings.GEMINI_API_KEY:
                try:
                    gemini_stream = cls._stream_gemini(greeting_messages)
                    for chunk in gemini_stream:
                        text_piece = chunk.text or ""
                        if text_piece:
                            yield f"data: {json.dumps({'type': 'token', 'content': text_piece})}\n\n"
                    provider_used = "gemini"
                    streamed_success = True
                except Exception as e:
                    logger.warning("Gemini greeting failed (%s). Falling back...", e)

            # Fallback Greeting
            if not streamed_success:
                tokens = cls._generate_mock_stream(query, "", [], None, is_greeting=True)
                for token in tokens:
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                    time.sleep(0.015)
                provider_used = "fallback-concierge"

            yield f"data: {json.dumps({'type': 'done', 'provider': provider_used})}\n\n"
            return

        # 3. RAG Retrieval from ChromaDB (with live PostgreSQL verification)
        rag_data = RAGService.retrieve_relevant_context(query, n_results=4, db=db)
        context = rag_data["context_text"]
        sources = rag_data["sources"]

        # Yield sources immediately to frontend so product cards render
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

        # 4. Autonomous Tool Calling check if DB session available
        tools_executed: List[Dict[str, Any]] = []
        if db is not None:
            try:
                # Detect and run tools via AIAgentService local reasoner
                _, agent_tools = AIAgentService._local_agent_reasoner(query, db)
                if agent_tools:
                    tools_executed = agent_tools
                    for t in agent_tools:
                        yield f"data: {json.dumps({'type': 'tool_executed', 'tool': t['tool'], 'result': t['result']})}\n\n"
            except Exception as e:
                logger.warning("Tool calling agent check skipped: %s", e)

        messages = cls.build_prompt(query, context, history)
        provider_used = "mock"
        streamed_success = False

        # 5. Try Groq Provider
        if settings.GROQ_API_KEY:
            try:
                logger.info(f"Attempting primary provider: Groq ({settings.GROQ_MODEL})")
                groq_stream = cls._stream_groq(messages)
                for chunk in groq_stream:
                    delta = chunk.choices[0].delta.content or ""
                    if delta:
                        yield f"data: {json.dumps({'type': 'token', 'content': delta})}\n\n"
                provider_used = "groq"
                streamed_success = True
            except Exception as e:
                logger.warning(f"Groq provider failed ({e}). Falling back to next provider...")

        # 6. Try Gemini Provider (Fallback 1)
        if not streamed_success and settings.GEMINI_API_KEY:
            try:
                logger.info(f"Attempting fallback provider: Gemini ({settings.GEMINI_MODEL})")
                gemini_stream = cls._stream_gemini(messages)
                for chunk in gemini_stream:
                    text_piece = chunk.text or ""
                    if text_piece:
                        yield f"data: {json.dumps({'type': 'token', 'content': text_piece})}\n\n"
                provider_used = "gemini"
                streamed_success = True
            except Exception as e:
                logger.warning(f"Gemini provider failed ({e}). Falling back to local assistant...")

        # 7. Fallback Provider (Grounding in ChromaDB sources + executed tools)
        if not streamed_success:
            logger.info("Using Intelligent Grounded Fallback Provider")
            tokens = cls._generate_mock_stream(query, context, sources, tools_executed, is_greeting=False)
            for token in tokens:
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                # Typing latency simulation (15ms) for realistic streaming
                time.sleep(0.015)
            provider_used = "fallback-rag"

        # 8. Yield Done Event
        yield f"data: {json.dumps({'type': 'done', 'provider': provider_used})}\n\n"
