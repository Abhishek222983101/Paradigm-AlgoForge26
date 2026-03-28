"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  ChevronDown,
  Minimize2,
  Maximize2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: {
    id: string;
    type: "trial" | "patient";
    title: string;
    relevance: number;
  }[];
  loading?: boolean;
}

interface ChatRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "ready" | "error">("loading");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    if (apiStatus === "loading") {
      checkApiStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkApiStatus = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setApiStatus("ready");
        if (messages.length === 0) {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: `Hey! I'm TrialMatch AI 🤖\n\nI have access to ${data.trials || 30} Indian clinical trials & ${data.patients || 35} patient records.\n\nI can help you find trials, check eligibility & more. Ask me anything!`
          }]);
        }
      } else {
        setApiStatus("error");
      }
    } catch {
      setApiStatus("error");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => !m.loading)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history })
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setMessages(prev => prev.map(m => 
        m.id === loadingMessage.id 
          ? { ...m, content: data.response, loading: false, sources: data.sources }
          : m
      ));
    } catch {
      setMessages(prev => prev.map(m => 
        m.id === loadingMessage.id 
          ? { ...m, content: "Oops! Something went wrong. Check if GEMINI_API_KEY is set.", loading: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full border-brutal shadow-brutal-lg hover:bg-lime-green hover:text-black transition-all transform hover:scale-110 group"
      >
        <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-lime-green rounded-full border-2 border-black animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? "w-80 h-14" : "w-96 h-[500px]"}`}>
      <div className="h-full bg-white border-brutal shadow-brutal-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b-4 border-lime-green">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-lime-green rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-heading font-black uppercase text-sm">TrialMatch AI</h3>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${apiStatus === "ready" ? "bg-lime-green" : apiStatus === "error" ? "bg-hot-coral" : "bg-cyber-yellow"}`} />
                <span className="font-mono text-[10px]">
                  {apiStatus === "ready" ? "Online" : apiStatus === "error" ? "Error" : "Loading..."}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-cream/50">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-cyber-yellow" : "bg-lime-green"
                  }`}>
                    {message.role === "user" ? (
                      <User className="w-3 h-3 text-black" strokeWidth={3} />
                    ) : (
                      <Bot className="w-3 h-3 text-black" strokeWidth={3} />
                    )}
                  </div>
                  <div className={`max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block p-2 border-2 border-black ${
                      message.role === "user" ? "bg-black text-white" : "bg-white"
                    } ${message.loading ? "animate-pulse" : ""}`}>
                      {message.loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="font-mono text-xs">Thinking...</span>
                        </div>
                      ) : (
                        <p className="font-mono text-xs whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {message.sources && message.sources.length > 0 && !message.loading && (
                      <div className="mt-1">
                        <button
                          onClick={() => setShowSources(showSources === message.id ? null : message.id)}
                          className="flex items-center gap-1 font-mono text-[10px] text-black/40 hover:text-black"
                        >
                          <Sparkles className="w-3 h-3" />
                          {showSources === message.id ? "Hide" : "Sources"}
                        </button>
                        
                        {showSources === message.id && (
                          <div className="mt-1 space-y-1">
                            {message.sources.slice(0, 3).map((source, i) => (
                              <div key={i} className="flex items-center gap-1 text-[10px] font-mono bg-white border border-black/10 px-1 truncate">
                                <span className={source.type === "trial" ? "text-lime-green" : "text-cyber-yellow"}>
                                  {source.type === "trial" ? "🔬" : "👤"}
                                </span>
                                <span className="truncate">{source.title.substring(0, 25)}...</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2">
                <div className="flex flex-wrap gap-1">
                  {["NSCLC trials", "EGFR positive", "Phase 3", "Mumbai"].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="font-mono text-[10px] bg-white border border-black/20 px-2 py-0.5 hover:bg-lime-green hover:border-black transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t-4 border-black">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about trials..."
                  disabled={isLoading}
                  className="flex-1 bg-cream border-2 border-black px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-black text-white p-2 border-2 border-black hover:bg-lime-green hover:text-black disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
