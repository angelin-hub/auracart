import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useUIStore } from "@/store/uiStore";
import { toINR } from "@/lib/currency";

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      const { data } = await api.get(`/ai/suggestions?query=${encodeURIComponent(query)}`);
      return data.data.suggestions as any[];
    },
    enabled: query.length >= 2,
  });

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(34,46,80,0.12)", boxShadow: "0 16px 48px rgba(34,46,80,0.15)" }}>
              {/* Input */}
              <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid rgba(34,46,80,0.08)" }}>
                <Search size={18} style={{ color: "rgba(34,46,80,0.35)" }} className="flex-shrink-0" />
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: "#222E50" }} aria-label="Search" />
                {query ? (
                  <button onClick={() => setQuery("")} style={{ color: "rgba(34,46,80,0.35)" }}>
                    <X size={16} />
                  </button>
                ) : (
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                    style={{ background: "rgba(34,46,80,0.06)", color: "rgba(34,46,80,0.4)" }}>ESC</kbd>
                )}
              </div>

              {/* Results */}
              {query.length >= 2 && (
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 shimmer rounded-lg" />
                      ))}
                    </div>
                  ) : suggestions && suggestions.length > 0 ? (
                    <div className="p-2">
                      {suggestions.map((item) => (
                        <Link key={item.id} to={`/products/${item.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group"
                        style={{ color: "#222E50" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,46,80,0.05)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#f5f5f5" }}>
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={14} style={{ color: "rgba(34,46,80,0.2)" }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#222E50" }}>{item.name}</p>
                          {item.brand && <p className="text-xs" style={{ color: "rgba(34,46,80,0.4)" }}>{item.brand}</p>}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "#222E50" }}>{toINR(item.price)}</span>
                      </Link>
                      ))}
                      <Link to={`/shop?search=${encodeURIComponent(query)}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl transition-colors mt-1 pt-3"
                        style={{ borderTop: "1px solid rgba(34,46,80,0.08)", color: "#222E50" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(252,203,6,0.08)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <span className="text-sm font-medium">View all results for "{query}"</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm" style={{ color: "rgba(34,46,80,0.4)" }}>No products found for "{query}"</p>
                      <Link to={`/shop?search=${encodeURIComponent(query)}`} onClick={() => setSearchOpen(false)}
                        className="text-sm font-medium mt-2 inline-block hover:underline" style={{ color: "#222E50" }}>
                        Browse all products →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!query && (
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(34,46,80,0.35)" }}>Trending</p>
                  <div className="flex flex-wrap gap-2">
                    {["Luxury Watch","Premium Headphones","Gaming Setup","Skincare"].map(term => (
                      <button key={term} onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{ background: "rgba(34,46,80,0.06)", color: "#222E50", border: "1px solid rgba(34,46,80,0.1)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(252,203,6,0.15)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,46,80,0.06)"}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
