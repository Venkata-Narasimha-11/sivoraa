import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  User,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  Package,
  RefreshCw,
  CreditCard,
  Headphones,
  Crown,
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import useAuthStore from '../../stores/useAuthStore';
import useCartStore from '../../stores/useCartStore';
import { toast } from 'sonner';
import { API_BASE_URL, WS_BASE_URL } from '../../config/apiConfig';

interface ProductCitation {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  slug: string;
  relevance_score?: number;
}

interface LiveChatMessage {
  id: string;
  sender: string;
  sender_role: 'admin' | 'customer';
  text: string;
  time: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ProductCitation[];
  isStreaming?: boolean;
}

type ConciergeTab = 'live_support' | 'ai_stylist';

const FASHION_AI_SUGGESTIONS = [
  '🥻 Saree recommendations for Diwali & weddings',
  '👔 Check stock for Men French Linen Shirt',
  '👶 Show Boys ethnic sherwani & kurta sets',
  '🏷️ Calculate discount with coupon SAVE10',
];

const SUPPORT_QUICK_ACTIONS = [
  {
    icon: Package,
    label: 'Track My Order',
    query: 'Can you help me check the status and estimated delivery time for my recent order?',
  },
  {
    icon: RefreshCw,
    label: '7-Day Return Policy',
    query: 'What is the return and exchange policy for SIVORA luxury garments?',
  },
  {
    icon: CreditCard,
    label: 'Payment & Refunds',
    query: 'What payment modes are accepted and how fast are refunds processed?',
  },
  {
    icon: Headphones,
    label: 'Talk to Human Concierge',
    query: 'Hello, I would like to speak directly with a dedicated SIVORA customer support specialist.',
  },
];

export const SivoraConciergeHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ConciergeTab>('live_support');
  const [hasUnread, setHasUnread] = useState(false);

  // ── Auth & Store Hooks ──────────────────────────────────────────────────────
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const addItemToCart = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  // ── 1. Real-time Live WebSocket Support State ──────────────────────────────
  const [liveInput, setLiveInput] = useState('');
  const [liveMessages, setLiveMessages] = useState<LiveChatMessage[]>([
    {
      id: 'welcome-concierge',
      sender: 'SIVORA Concierge',
      sender_role: 'admin',
      text: 'Namaste! Welcome to ATELIER SIVORA Live Support Desk. Our dedicated styling and customer care team is connected in real-time. How may we assist your bespoke shopping experience today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const wsBase = WS_BASE_URL;
  const chatRoomId = 'general_support';
  const wsUrl = `${wsBase}/chat/${chatRoomId}`;

  const { isConnected, lastMessage, sendMessage, reconnectCount } = useWebSocket(wsUrl, {
    autoReconnect: true,
    maxRetries: 15,
    baseDelay: 1000,
  });

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.event === 'CHAT_JOINED' && Array.isArray(lastMessage.history)) {
      if (lastMessage.history.length > 0) {
        setLiveMessages((prev) => {
          const welcome = prev.filter((m) => m.id === 'welcome-concierge');
          return [...welcome, ...lastMessage.history];
        });
      }
      return;
    }

    if (lastMessage.text && lastMessage.sender) {
      setLiveMessages((prev) => [
        ...prev,
        {
          id: lastMessage.id || `msg-${Date.now()}-${Math.random()}`,
          sender: lastMessage.sender,
          sender_role: lastMessage.sender_role || 'customer',
          text: lastMessage.text,
          time: lastMessage.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (!isOpen) {
        setHasUnread(true);
      }
    }
  }, [lastMessage, isOpen]);

  const handleSendLiveMessage = (textToSend?: string) => {
    const text = (textToSend || liveInput).trim();
    if (!text) return;

    const currentUserName = user?.username || (isAdmin ? 'Admin Concierge' : 'Guest Customer');
    const role = isAdmin ? 'admin' : 'customer';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const payload = {
      sender: currentUserName,
      sender_role: role,
      text,
      time: timeStr,
    };

    sendMessage(payload);
    setLiveInput('');
  };

  // ── 2. AI Fashion Stylist & Shopping Assistant State ────────────────────────
  const [aiInput, setAiInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      content:
        'Hello! I am your SIVORA AI Stylist & Shopping Assistant ✨ Powered by autonomous catalog retrieval, I can check live warehouse inventory, recommend matching couture across 360 artisanal pieces, and calculate coupon discounts with SAVE10. How can I curate your wardrobe today?',
    },
  ]);

  const liveScrollRef = useRef<HTMLDivElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'live_support') {
        liveScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        aiScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isOpen, activeTab, liveMessages, aiMessages]);

  const handleSendAiMessage = async (textToSend?: string) => {
    const query = (textToSend || aiInput).trim();
    if (!query || isAiGenerating) return;

    setAiInput('');
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `asst_${Date.now()}`;

    setAiMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: query },
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true, sources: [] },
    ]);

    setIsAiGenerating(true);

    try {
      const historyForApi = aiMessages
        .filter((m) => m.id !== 'ai-welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const apiBase = API_BASE_URL;
      const response = await fetch(`${apiBase}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyForApi,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed to initiate.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';
      let accumulatedSources: ProductCitation[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === 'token' || data.type === 'content') {
                accumulatedContent += data.content;
                setAiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
                  )
                );
              } else if (data.type === 'sources') {
                accumulatedSources = data.sources || [];
                setAiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, sources: accumulatedSources } : msg
                  )
                );
              } else if (data.type === 'done') {
                setAiMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      setAiMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error('Error streaming AI response:', error);
      setAiMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  'I apologize, I am momentarily having trouble retrieving real-time catalog recommendations. Please verify the backend service is running, or switch to Live Support to speak with our concierge.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAddCitationToCart = (p: ProductCitation) => {
    if (!isAuthenticated) {
      setIsOpen(false);
      navigate('/login');
      return;
    }
    addItemToCart(
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: '',
        price: p.price,
        stock: p.stock,
        category_id: 1,
        category: { id: 1, name: p.category, slug: p.category.toLowerCase(), created_at: new Date().toISOString() },
        image_url: p.image_url,
        thumbnail_url: p.image_url,
        is_active: true,
        created_at: '',
        updated_at: '',
      },
      1
    );
    toast.success(`Added ${p.name} to cart!`);
  };

  const openInTab = (tab: ConciergeTab) => {
    setActiveTab(tab);
    setIsOpen(true);
    setHasUnread(false);
  };

  return (
    <>
      {/* ── Global Floating Luxury Launcher Dock ─────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center shadow-2xl rounded-full bg-[#1c1204]/95 text-[#fbf8f2] border border-[#d4af37]/60 backdrop-blur-md p-1.5 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(212,175,55,0.35)] hover:scale-[1.02]">
          {/* Live Support Pill */}
          <button
            onClick={() => openInTab('live_support')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-[#d4af37]/20 transition-all text-xs font-semibold tracking-wider uppercase text-[#f7eacc] group"
            aria-label="Open Live Customer Support"
          >
            <div className="relative flex items-center justify-center">
              <Headphones className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-[#1c1204] ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>
            <span>Live Support</span>
            {hasUnread && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-[#d4af37]/40 my-auto" />

          {/* AI Stylist Pill */}
          <button
            onClick={() => openInTab('ai_stylist')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] hover:from-[#e5c986] hover:to-[#caa14d] text-[#1c1204] font-bold text-xs tracking-wider uppercase transition-all shadow-md group"
            aria-label="Open AI Shopping Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1c1204] group-hover:rotate-12 transition-transform" />
            <span>AI Stylist</span>
          </button>
        </div>
      )}

      {/* ── Integrated Luxury Concierge Modal ─────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] rounded-3xl bg-[#fcf9f2] text-[#2a1805] shadow-[0_20px_60px_rgba(28,18,4,0.45)] border border-[#caa14d]/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans">
          
          {/* Header Bar */}
          <div className="bg-[#1c1204] text-[#fbf8f2] px-5 py-3.5 border-b border-[#caa14d]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#caa14d]/20 border border-[#caa14d]/60 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-[#dfbe6e]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-wide text-[#fdf6e2] font-serif">
                    ATELIER SIVORA
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#caa14d]/20 text-[#dfbe6e] uppercase tracking-widest border border-[#caa14d]/30">
                    Concierge
                  </span>
                </div>
                <p className="text-[11px] text-[#caa14d] flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {activeTab === 'live_support'
                      ? isConnected
                        ? 'Support Desk Online • Real-time'
                        : reconnectCount > 0
                        ? `Reconnecting (${reconnectCount})...`
                        : 'Connecting Live Desk...'
                      : 'AI Assistant Active • RAG Intelligence'}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#caa14d] hover:text-[#fdf6e2] transition-colors"
              aria-label="Close Concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-[#f2e7cc]/90 px-3 py-2 border-b border-[#caa14d]/30 flex gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('live_support')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'live_support'
                  ? 'bg-[#1c1204] text-[#dfbe6e] shadow-md border border-[#caa14d]/50'
                  : 'text-[#6b4e12] hover:bg-[#caa14d]/20'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Live Support</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_stylist')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ai_stylist'
                  ? 'bg-gradient-to-r from-[#b8860b] to-[#91660d] text-[#fdf6e2] shadow-md'
                  : 'text-[#6b4e12] hover:bg-[#caa14d]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Stylist</span>
            </button>
          </div>

          {/* ── TAB 1: LIVE CUSTOMER SUPPORT ──────────────────────────────── */}
          {activeTab === 'live_support' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#fbf8f2]">
              {/* Quick Support Topics Accordion */}
              <div className="px-4 py-2.5 bg-[#f7eed8]/70 border-b border-[#caa14d]/20 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] shrink-0">
                <span className="text-[10px] font-bold text-[#8a651a] tracking-wider uppercase shrink-0">
                  Quick Help:
                </span>
                {SUPPORT_QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendLiveMessage(action.query)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-[#caa14d]/40 text-[#4a3407] hover:bg-[#d4af37] hover:text-[#1c1204] font-medium whitespace-nowrap transition-all shadow-xs"
                  >
                    <action.icon className="w-3 h-3 shrink-0" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Live Chat Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-h-0 bg-radial from-[#ffffff] to-[#faf3e3]">
                {liveMessages.map((msg) => {
                  const isMine =
                    (isAdmin && msg.sender_role === 'admin') ||
                    (!isAdmin && msg.sender_role === 'customer' && msg.sender !== 'SIVORA Concierge');

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {msg.sender_role === 'admin' ? (
                          <div className="flex items-center gap-1 text-[#91660d]">
                            <ShieldCheck className="w-3 h-3 text-[#b8860b]" />
                            <span className="text-[10px] font-bold tracking-wide">
                              {msg.sender}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-semibold">
                              {msg.sender}
                            </span>
                          </div>
                        )}
                        <span className="text-[9px] text-[#8a651a]/60 font-mono">{msg.time}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-[#1c1204] text-[#f7eacc] rounded-br-xs border border-[#caa14d]/30 font-medium'
                            : 'bg-white border border-[#caa14d]/30 text-[#2a1805] rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={liveScrollRef} />
              </div>

              {/* Live Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendLiveMessage();
                }}
                className="p-3 bg-white border-t border-[#caa14d]/30 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={liveInput}
                  onChange={(e) => setLiveInput(e.target.value)}
                  placeholder={
                    isConnected ? 'Ask real-time customer concierge...' : 'Connecting to live desk...'
                  }
                  disabled={!isConnected}
                  className="flex-1 rounded-xl border border-[#caa14d]/40 bg-[#fdfbf6] px-3.5 py-2 text-xs text-[#2a1805] placeholder:text-[#8a651a]/60 focus:outline-none focus:ring-2 focus:ring-[#caa14d] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !liveInput.trim()}
                  className="p-2.5 rounded-xl bg-[#1c1204] text-[#dfbe6e] hover:bg-[#2e1d07] disabled:opacity-40 transition-colors flex items-center justify-center shadow-sm"
                  aria-label="Send live message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* ── TAB 2: AI FASHION STYLIST & SHOPPING ASSISTANT ─────────────── */}
          {activeTab === 'ai_stylist' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#fbf8f2]">
              {/* Fashion Suggestion Chips */}
              <div className="px-3 py-2 bg-[#f7eed8]/70 border-b border-[#caa14d]/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] shrink-0">
                {FASHION_AI_SUGGESTIONS.map((pill, idx) => (
                  <button
                    key={idx}
                    disabled={isAiGenerating}
                    onClick={() => handleSendAiMessage(pill)}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-white/90 hover:bg-[#d4af37] hover:text-[#1c1204] border border-[#caa14d]/40 text-[#4a3407] font-medium transition-all shadow-xs shrink-0"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* AI Chat Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-h-0 bg-radial from-[#ffffff] to-[#faf3e3]">
                {aiMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isUser ? (
                          <div className="flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-semibold">You</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[#91660d]">
                            <Sparkles className="w-3 h-3 text-[#b8860b]" />
                            <span className="text-[10px] font-bold tracking-wide">
                              SIVORA AI Stylist
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-[#1c1204] text-[#f7eacc] rounded-br-xs border border-[#caa14d]/30 font-medium'
                            : 'bg-white border border-[#caa14d]/30 text-[#2a1805] rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Streaming Indicator */}
                        {msg.isStreaming && !msg.content && (
                          <div className="flex items-center gap-2 text-[#91660d] py-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-[11px] italic font-serif">
                              Consulting Atelier catalog &amp; stock...
                            </span>
                          </div>
                        )}

                        {/* Interactive Product Citation Cards */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#caa14d]/30 space-y-2">
                            <p className="text-[10px] font-bold text-[#8a651a] uppercase tracking-wider flex items-center gap-1">
                              <Crown className="w-3 h-3 text-[#b8860b]" /> Curated Pieces Found
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {msg.sources.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-[#fdfbf6] border border-[#caa14d]/40 hover:border-[#caa14d] transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-10 h-10 rounded-lg object-cover bg-amber-50 shrink-0 border border-[#caa14d]/30"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-[#caa14d]/20 flex items-center justify-center shrink-0">
                                        <ShoppingBag className="w-4 h-4 text-[#91660d]" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <h5 className="font-bold text-xs text-[#2a1805] truncate">
                                        {product.name}
                                      </h5>
                                      <p className="text-[11px] text-[#6b4e12] font-semibold">
                                        ₹{product.price.toLocaleString()} •{' '}
                                        <span className="text-emerald-700 font-bold">
                                          In Stock ({product.stock})
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 ml-2 shrink-0">
                                    <button
                                      onClick={() => handleAddCitationToCart(product)}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#1c1204] hover:bg-[#3d2a04] text-[#dfbe6e] text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                                      title="Add to bag"
                                    >
                                      <ShoppingBag className="w-3 h-3" />
                                      Add
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={aiScrollRef} />
              </div>

              {/* AI Chat Input */}
              <div className="p-3 bg-white border-t border-[#caa14d]/30 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={aiInput}
                  disabled={isAiGenerating}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                  placeholder="Ask for outfit ideas, stock, coupon discount..."
                  className="flex-1 rounded-xl border border-[#caa14d]/40 bg-[#fdfbf6] px-3.5 py-2 text-xs text-[#2a1805] placeholder:text-[#8a651a]/60 focus:outline-none focus:ring-2 focus:ring-[#caa14d] transition-all"
                />
                <button
                  onClick={() => handleSendAiMessage()}
                  disabled={!aiInput.trim() || isAiGenerating}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#91660d] text-[#fdf6e2] disabled:opacity-40 hover:opacity-95 transition-all shrink-0 shadow-sm"
                  aria-label="Send AI query"
                >
                  {isAiGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};

export default SivoraConciergeHub;
