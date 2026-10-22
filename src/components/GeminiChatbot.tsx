import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  Search,
  Globe,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Briefcase,
  Target,
  Users,
  ExternalLink,
  ChevronRight,
  Zap,
  Cpu,
  Layers
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingChunks?: Array<{ uri: string; title: string }>;
  modelUsed?: string;
}

export const GeminiChatbot: React.FC<{ onOpenVoice: () => void }> = ({ onOpenVoice }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am your **Kaushalam Academic & Peer Learning Assistant**. \n\nI can help you:\n- **Prepare for peer learning sessions** by breaking down technical concepts and algorithms.\n- **Draft sharp learning objectives** to submit to student mentors.\n- **Search up-to-date documentation and campus tech stacks** using Google Search Grounding.\n- **Practice viva and placement interview questions**.\n\nSelect a mentor role or ask me any question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<'academic' | 'interview' | 'objective' | 'clubs'>('academic');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const rolesConfig = {
    academic: {
      label: 'Academic & Algorithms Tutor',
      icon: BookOpen,
      desc: 'Deep dives into DSA, dynamic programming, proofs, and time complexities',
      system: 'You are Kaushalam Academic & Algorithms Tutor. Explain engineering concepts, data structures, proofs, and time complexities clearly with step-by-step logic and code examples.'
    },
    interview: {
      label: 'Placement & HR Mock Coach',
      icon: Briefcase,
      desc: 'Simulates technical and behavioral questions using STAR framework',
      system: 'You are Kaushalam Placement & HR Interview Coach. Run mock interview simulations, critique student responses using the STAR method, and give constructive placement advice.'
    },
    objective: {
      label: 'Session Goal Generator',
      icon: Target,
      desc: 'Transforms vague queries into high-impact 1-on-1 session objectives',
      system: 'You are Kaushalam Session Objective Drafter. Help college students turn ambiguous study desires into concrete, high-impact 1-on-1 session goals for student teachers.'
    },
    clubs: {
      label: 'Campus Societies & Tech Trends',
      icon: Users,
      desc: 'Explores latest developer frameworks, hackathons, and student clubs',
      system: 'You are Kaushalam Campus Life & Tech Guide. Recommend student clubs, hackathons, and emerging developer roadmaps with up-to-date tech references.'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Format messages for API
      const apiPayloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendChatMessage({
        messages: apiPayloadMessages,
        model: selectedModel,
        systemInstruction: rolesConfig[activeRole].system,
        enableSearch
      });

      const modelMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: res.groundingChunks,
        modelUsed: res.modelUsed
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: `Error: ${err?.message || 'Unable to retrieve answer. Please verify your connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear current conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: 'Conversation history cleared. How can I assist you with your peer studies today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const suggestions = [
    'Explain DP state transitions for Longest Common Subsequence',
    'Help me draft a learning objective to book a mentor for React 19',
    'Search latest system design interview questions for 2026',
    'Ask me a behavioral question about handling project deadlines'
  ];

  return (
    <div className="bg-white border border-[#D3D1CB] rounded-xl shadow-xs overflow-hidden flex flex-col h-[750px]">
      {/* Top Controls Bar */}
      <div className="p-4 bg-[#FAF9F6] border-b border-[#E9E9E7] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Title and Role */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#F1F1EF] border border-[#D3D1CB] flex items-center justify-center text-lg select-none">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-[#37352F] text-sm flex items-center gap-2">
              Kaushalam Assistant
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white text-[#787774] border border-[#E9E9E7]">
                Multi-Turn
              </span>
            </h3>
            <p className="text-[11px] text-[#787774]">
              Persona: <strong className="text-[#37352F]">{rolesConfig[activeRole].label}</strong>
            </p>
          </div>
        </div>

        {/* Model and Feature Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D3D1CB] rounded-md px-2 py-1 shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-[#787774]" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[#37352F] text-xs focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General & Search)</option>
              <option value="gemini-4-argon">gemini-4-argon (Complex Reasoning)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>
          </div>

          {/* Search Grounding Toggle */}
          <button
            type="button"
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              enableSearch
                ? 'bg-[#37352F] text-white border-[#37352F] shadow-xs'
                : 'bg-white text-[#787774] border-[#D3D1CB] hover:text-[#37352F]'
            }`}
            title="Toggle Google Search Grounding for live web information"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Grounding</span>
          </button>

          {/* Voice Conversation Modal trigger */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#2F2E2A] hover:bg-[#45433E] text-white shadow-xs transition-colors"
            title="Open Gemini 3.8 Live Voice practice session"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Live Voice</span>
          </button>

          {/* Clear chat */}
          <button
            onClick={handleClearHistory}
            className="p-1 rounded-md text-[#787774] hover:text-rose-600 hover:bg-[#F1F1EF] transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role Switcher Chips */}
      <div className="px-4 py-2 bg-[#FAF9F6] border-b border-[#E9E9E7] flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[#9B9A97] text-[11px] font-semibold whitespace-nowrap">Persona:</span>
        {(Object.keys(rolesConfig) as Array<keyof typeof rolesConfig>).map((key) => {
          const config = rolesConfig[key];
          const Icon = config.icon;
          const isActive = activeRole === key;
          return (
            <button
              key={key}
              onClick={() => setActiveRole(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#37352F] text-white shadow-xs'
                  : 'bg-white text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] border border-[#E9E9E7]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-[#37352F] text-white'
                    : 'bg-[#F1F1EF] border border-[#D3D1CB] text-[#37352F]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#F1F1EF] text-[#37352F] border border-[#E9E9E7]'
                    : 'bg-[#FAF9F6] border border-[#E9E9E7] text-[#37352F]'
                }`}
              >
                {/* Meta info */}
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-[#9B9A97]">
                  <span className="font-semibold text-[#787774]">{isUser ? 'You' : 'Assistant'}</span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-white border border-[#E9E9E7] text-[#787774]">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-[#37352F]"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans text-xs text-[#37352F]">{msg.content}</div>

                {/* Grounding Source Citations (from Google Search) */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E9E9E7] space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774] flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#37352F]" />
                      <span>Verified Google Search Sources:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.groundingChunks.map((chunk, i) => (
                        <a
                          key={i}
                          href={chunk.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#D3D1CB] text-[#37352F] text-[10px] hover:bg-[#F1F1EF] transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{chunk.title || chunk.uri}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-[#9B9A97]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#F1F1EF] border border-[#D3D1CB] flex items-center justify-center text-[#37352F]">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-[#FAF9F6] border border-[#E9E9E7] rounded-xl p-3 text-xs text-[#787774] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#37352F] animate-ping" />
              <span>Thinking with {rolesConfig[activeRole].label}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts suggestions */}
      <div className="px-4 py-2 bg-[#FAF9F6] border-t border-[#E9E9E7] flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-[#9B9A97] whitespace-nowrap font-medium">Suggestions:</span>
        {suggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F] border border-[#D3D1CB] whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3.5 bg-white border-t border-[#E9E9E7]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${rolesConfig[activeRole].label}...`}
            className="flex-1 bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:bg-white focus:border-[#37352F]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
