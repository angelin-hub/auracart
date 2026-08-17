import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { ChatMessage } from "@/types";
import { Link } from "react-router-dom";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";

const uuidv4 = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "**Namaste! 🌸 Welcome to Yehovah Boutique!**\n\nI'm your personal Style Assistant. Let me help you:\n\n• 👗 Discover dresses, kurtis & sarees\n• 💡 Get personalised outfit recommendations\n• 📦 Know about sizing, fabric & care\n\nWhat are you looking for today?",
  timestamp: new Date(),
};

export default function AuraBot() {
  const { chatOpen, setChatOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [chatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !isAuthenticated) return;
    const userMsg: ChatMessage = {
      id: uuidv4(), role: "user", content: input.trim(), timestamp: new Date(),
    };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const history = messages.filter(m => m.id !== "welcome").slice(-6)
        .map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post("/ai/chat", { message: userMsg.content, history });
      setMessages(p => [...p, {
        id: uuidv4(), role: "assistant", content: data.data.message, timestamp: new Date(),
      }]);
    } catch {
      setMessages(p => [...p, {
        id: uuidv4(), role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally { setIsLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatMsg = (content: string) =>
    content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        `<a href="$2" style="color:${BLUSH};font-weight:600;text-decoration:underline">$1</a>`,
      );

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-blush"
            style={{
              background: "linear-gradient(135deg, #c47a80, #d4909a)",
              boxShadow: "0 4px 20px rgba(196,122,128,0.45)",
            }}
            aria-label="Open style assistant"
          >
            <Sparkles size={22} className="text-white" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: BLUSH }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm flex flex-col rounded-2xl overflow-hidden"
            style={{
              height: "min(560px, calc(100vh - 5rem))",
              background: "white",
              border: "1px solid rgba(44,35,32,0.1)",
              boxShadow: "0 16px 48px rgba(44,35,32,0.15)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4"
              style={{ background: "linear-gradient(135deg, #2c2320, #402a22)" }}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(196,122,128,0.25)", border: "1px solid rgba(196,122,128,0.5)" }}>
                  <Sparkles size={14} style={{ color: "#ebbfc5" }} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: "#22c55e", borderColor: "#2c2320" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Style Assistant</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Yehovah Boutique</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="ml-auto p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.5)" }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar"
              style={{ background: "#fdf8f3" }}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                      <Sparkles size={10} style={{ color: "white" }} />
                    </div>
                  )}
                  <div
                    className="max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, #2c2320, #402a22)"
                        : "white",
                      color: msg.role === "user" ? "white" : DARK,
                      borderRadius: msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      boxShadow: "0 1px 4px rgba(44,35,32,0.08)",
                    }}
                    dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }}
                  />
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                    <Sparkles size={10} style={{ color: "white" }} />
                  </div>
                  <div className="bg-white px-3 py-2.5 rounded-2xl" style={{ borderRadius: "16px 16px 16px 4px" }}>
                    <Loader2 size={14} className="animate-spin" style={{ color: "rgba(44,35,32,0.4)" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3" style={{ borderTop: "1px solid rgba(44,35,32,0.08)", background: "white" }}>
              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-xs mb-2" style={{ color: "rgba(44,35,32,0.5)" }}>
                    Sign in to chat with your Style Assistant
                  </p>
                  <Link to="/auth/login" onClick={() => setChatOpen(false)} className="btn-outline text-xs py-2 px-4">
                    Sign in
                  </Link>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about styles, sizes, fabric..."
                    rows={1}
                    className="flex-1 text-sm resize-none outline-none rounded-xl px-3 py-2.5"
                    style={{
                      background: "#fdf8f3",
                      border: "1.5px solid rgba(44,35,32,0.15)",
                      color: DARK,
                      maxHeight: "80px",
                    }}
                    aria-label="Message"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 rounded-xl transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)", color: "white" }}
                    aria-label="Send"
                  >
                    <Send size={15} />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
