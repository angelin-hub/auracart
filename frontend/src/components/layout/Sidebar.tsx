import { motion, AnimatePresence } from "framer-motion";
import { X, Home, ShoppingBag, Heart, Package, Grid3X3, Star, Bot, Settings, ChevronRight, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useCategories } from "@/hooks/useProducts";

const navItems = [
  { icon: <Home size={17} />, label: "Home", href: "/" },
  { icon: <ShoppingBag size={17} />, label: "Shop", href: "/shop" },
  { icon: <Star size={17} />, label: "Collections", href: "/collections" },
  { icon: <Heart size={17} />, label: "Wishlist", href: "/wishlist", auth: true },
  { icon: <Package size={17} />, label: "My Orders", href: "/orders", auth: true },
  { icon: <Bot size={17} />, label: "AI Assistant", href: "#ai" },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, setChatOpen } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const { data: categories } = useCategories();

  const handleNavClick = (href: string) => {
    if (href === "#ai") setChatOpen(true);
    setSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(34,46,80,0.3)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)} />

          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-y-auto"
            style={{ background: "white", borderRight: "1px solid rgba(34,46,80,0.1)", boxShadow: "4px 0 24px rgba(34,46,80,0.12)" }}>

            {/* Header */}
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid rgba(34,46,80,0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #FCCB06, #fdd535)" }}>
                  <Sparkles size={15} style={{ color: "#222E50" }} />
                </div>
                <span className="font-display font-bold text-lg" style={{ color: "#222E50" }}>
                  Aura<span style={{ color: "#FCCB06" }}>Cart</span>
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(34,46,80,0.4)" }}
                aria-label="Close sidebar">
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.filter(i => !i.auth || isAuthenticated).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(252,203,6,0.15)" : "transparent",
                      color: isActive ? "#222E50" : "rgba(34,46,80,0.6)",
                      border: isActive ? "1px solid rgba(252,203,6,0.4)" : "1px solid transparent",
                    }}>
                    <span style={{ color: isActive ? "#FCCB06" : "rgba(34,46,80,0.4)" }}>{item.icon}</span>
                    {item.label}
                    {isActive && <ChevronRight size={14} className="ml-auto" style={{ color: "#FCCB06" }} />}
                  </Link>
                );
              })}

              {/* Categories */}
              {categories && categories.length > 0 && (
                <div className="pt-4">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "rgba(34,46,80,0.35)" }}>Categories</p>
                  {categories.slice(0, 10).map((cat) => (
                    <Link key={cat.id} to={`/shop?category=${cat.slug}`}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                      style={{ color: "rgba(34,46,80,0.55)" }}>
                      <Grid3X3 size={14} style={{ color: "rgba(34,46,80,0.3)" }} />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {user?.role === "admin" && (
                <div className="pt-3" style={{ borderTop: "1px solid rgba(34,46,80,0.08)", marginTop: "8px" }}>
                  <Link to="/admin" onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: "#d4a500", background: "rgba(252,203,6,0.08)" }}>
                    <Settings size={17} style={{ color: "#FCCB06" }} />
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </nav>

            <div className="p-4" style={{ borderTop: "1px solid rgba(34,46,80,0.08)" }}>
              <p className="text-xs text-center" style={{ color: "rgba(34,46,80,0.3)" }}>
                AuraCart © {new Date().getFullYear()}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
