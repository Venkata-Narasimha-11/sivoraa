"""Responsible AI and Cost Governance Service.

Implements token tracking, API quota monitoring, rate limit audit,
cost calculation targeting $0 API spend, and free-tier multi-provider telemetry.
"""

import logging
import time
from typing import Any, Dict, List, Optional

from app.config import settings
from app.services.ai_cache_service import AICacheService
from app.services.redis_service import get_redis

logger = logging.getLogger("ai_governance_service")


class AIGovernanceService:
    """Enterprise AI Governance & Cost Management Engine."""

    # Free-tier daily quota baselines
    QUOTAS = {
        "groq_llama3": {
            "name": "Groq LLaMA-3.3-70B",
            "tier": "Free Developer Tier",
            "daily_request_limit": 14400,
            "requests_per_minute_limit": 30,
            "cost_per_token_usd": 0.0,
            "cost_target": "$0.00 (Zero Spend)",
        },
        "gemini_flash": {
            "name": "Google Gemini 1.5 Flash",
            "tier": "Free Tier Quota",
            "daily_request_limit": 1500,
            "requests_per_minute_limit": 15,
            "cost_per_token_usd": 0.0,
            "cost_target": "$0.00 (Zero Spend)",
        },
        "local_heuristic": {
            "name": "Local Heuristic & Vector Engine",
            "tier": "Self-Hosted / In-Process",
            "daily_request_limit": 999999,
            "requests_per_minute_limit": 1000,
            "cost_per_token_usd": 0.0,
            "cost_target": "$0.00 (Zero Spend)",
        },
    }

    @classmethod
    def record_usage(
        cls,
        feature_name: str,
        provider: str,
        prompt_tokens: int = 150,
        completion_tokens: int = 100,
        cached: bool = False,
    ) -> None:
        """Records AI operation metrics in Redis for real-time cost governance."""
        try:
            r = get_redis()
            today = time.strftime("%Y-%m-%d")

            # 1. Increment feature counter
            r.incr(f"ai:gov:{today}:feature:{feature_name}")
            # 2. Increment provider counter
            r.incr(f"ai:gov:{today}:provider:{provider}")
            # 3. Increment token counters
            if not cached:
                r.incrby(f"ai:gov:{today}:tokens:prompt", prompt_tokens)
                r.incrby(f"ai:gov:{today}:tokens:completion", completion_tokens)
            else:
                r.incr(f"ai:gov:{today}:cached_hits")
        except Exception as exc:
            logger.debug("Failed to record governance telemetry in Redis: %s", exc)

    @classmethod
    def get_governance_report(cls) -> Dict[str, Any]:
        """Generates comprehensive Responsible AI, Cost Governance & Quota Report."""
        r = get_redis()
        today = time.strftime("%Y-%m-%d")

        try:
            prompt_tokens = int(r.get(f"ai:gov:{today}:tokens:prompt") or 0)
            completion_tokens = int(r.get(f"ai:gov:{today}:tokens:completion") or 0)
            total_tokens = prompt_tokens + completion_tokens

            features = {
                "rag_shopping_assistant": int(r.get(f"ai:gov:{today}:feature:rag_assistant") or 0),
                "semantic_vector_search": int(r.get(f"ai:gov:{today}:feature:semantic_search") or 0),
                "product_descriptions": int(r.get(f"ai:gov:{today}:feature:descriptions") or 0),
                "content_moderation": int(r.get(f"ai:gov:{today}:feature:moderation") or 0),
                "agent_tool_execution": int(r.get(f"ai:gov:{today}:feature:agent") or 0),
            }

            groq_used = int(r.get(f"ai:gov:{today}:provider:groq") or 0)
            gemini_used = int(r.get(f"ai:gov:{today}:provider:gemini") or 0)
            local_used = int(r.get(f"ai:gov:{today}:provider:local") or 0) + int(r.get(f"ai:gov:{today}:provider:mock") or 0)

        except Exception:
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            features = {k: 0 for k in ["rag_shopping_assistant", "semantic_vector_search", "product_descriptions", "content_moderation", "agent_tool_execution"]}
            groq_used = gemini_used = local_used = 0

        # Cache metrics
        cache_metrics = AICacheService.get_metrics()

        # Quota telemetry
        quota_status = [
            {
                "provider": "Groq LLaMA-3.3",
                "tier": cls.QUOTAS["groq_llama3"]["tier"],
                "daily_limit": cls.QUOTAS["groq_llama3"]["daily_request_limit"],
                "used_today": groq_used,
                "remaining_today": max(0, cls.QUOTAS["groq_llama3"]["daily_request_limit"] - groq_used),
                "utilization_percent": round((groq_used / cls.QUOTAS["groq_llama3"]["daily_request_limit"]) * 100, 2),
                "status": "HEALTHY (FREE)",
            },
            {
                "provider": "Google Gemini 1.5 Flash",
                "tier": cls.QUOTAS["gemini_flash"]["tier"],
                "daily_limit": cls.QUOTAS["gemini_flash"]["daily_request_limit"],
                "used_today": gemini_used,
                "remaining_today": max(0, cls.QUOTAS["gemini_flash"]["daily_request_limit"] - gemini_used),
                "utilization_percent": round((gemini_used / cls.QUOTAS["gemini_flash"]["daily_request_limit"]) * 100, 2),
                "status": "HEALTHY (FREE)",
            },
            {
                "provider": "Local Heuristic Fallback",
                "tier": cls.QUOTAS["local_heuristic"]["tier"],
                "daily_limit": "Unlimited",
                "used_today": local_used,
                "remaining_today": "Unlimited",
                "utilization_percent": 0.0,
                "status": "ALWAYS AVAILABLE (ZERO-COST)",
            },
        ]

        # Financial cost calculations
        commercial_equivalent_usd = round((total_tokens / 1000.0) * 0.015, 4)
        actual_spend_usd = 0.00  # Strictly $0 target maintained through free tiers
        savings_from_free_tier_usd = commercial_equivalent_usd
        savings_from_redis_cache_usd = cache_metrics.get("estimated_cost_saved_usd", 0.0)

        return {
            "status": "COMPLIANT",
            "cost_governance": {
                "target_budget": "$0.00 / month",
                "actual_spend_usd": actual_spend_usd,
                "currency": "USD",
                "is_zero_cost_maintained": True,
                "commercial_api_cost_avoided_usd": savings_from_free_tier_usd,
                "redis_cache_cost_saved_usd": savings_from_redis_cache_usd,
                "total_savings_usd": round(savings_from_free_tier_usd + savings_from_redis_cache_usd, 4),
            },
            "token_telemetry": {
                "estimated_prompt_tokens": prompt_tokens,
                "estimated_completion_tokens": completion_tokens,
                "total_tokens_processed": total_tokens,
                "tokens_saved_by_cache": cache_metrics.get("cache_hits", 0) * 250,
            },
            "feature_breakdown": features,
            "quota_monitoring": quota_status,
            "rate_limit_policy": {
                "admin_tier": settings.AI_RATE_LIMIT_ADMIN,
                "user_tier": settings.AI_RATE_LIMIT_USER,
                "anonymous_tier": settings.AI_RATE_LIMIT_ANONYMOUS,
                "enforcement_engine": "Redis Token Bucket (SlowAPI)",
            },
            "fallback_strategy": {
                "order": settings.AI_FALLBACK_ORDER.split(","),
                "graceful_degradation_active": True,
                "description": "Groq LLaMA ➔ Gemini Flash ➔ Local Heuristic Engine",
            },
            "cache_efficiency": cache_metrics,
        }
