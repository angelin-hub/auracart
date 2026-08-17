import { motion, AnimatePresence } from "framer-motion";
import { X, Home, ShoppingBag, Heart, Package, Star, Bot, Settings, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useCategories } from "@/hooks/useProducts";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";

const navItems = [
  { icon: <Home size={17} />,       label: "Home",          href: "/" },
  { icon: <ShoppingBag size={17} />,label: "Shop",          href: "/shop" },
  { icon: <Star size={17} />,       label: "Collections",   href: "/collections" },
  { icon: <Heart size={17} />,      label: "Wishlist",      href: "/wishlist", auth: true },
  { icon: <Package size={17} />,    label: "My Orders",     href: "/orders",   auth: true },
  { icon: <Bot size={17} />,        label: "Style Assistant", href: "#ai" },
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(44,35,32,0.3)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-y-auto"
            style={{
              background: "#fdf8f3",
              borderRight: "1px solid rgba(44,35,32,0.1)",
              boxShadow: "4px 0 30px rgba(44,35,32,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid rgba(44,35,32,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                  <span className="text-white font-display font-bold text-sm">Y</span>
                </div>
                <span className="font-display font-semibold text-lg tracking-wide" style={{ color: DARK }}>
                  Yehovah <span style={{ color: BLUSH }}>Boutique</span>
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(44,35,32,0.4)" }}
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-0.5">
              {navItems.filter(i => !i.auth || isAuthenticated).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(196,122,128,0.1)" : "transparent",
                      color: isActive ? DARK : "rgba(44,35,32,0.6)",
                      border: isActive ? "1px solid rgba(196,122,128,0.25)" : "1px solid transparent",
                    }}
                  >
                    <span style={{ color: isActive ? BLUSH : "rgba(44,35,32,0.35)" }}>{item.icon}</span>
                    {item.label}
                    {isActive && <ChevronRight size={14} className="ml-auto" style={{ color: BLUSH }} />}
                  </Link>
                );
              })}

              {/* Category shortcuts */}
              {categories && categories.length > 0 && (
                <div className="pt-4">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "rgba(44,35,32,0.35)" }}>
                    Browse Categories
                  </p>
                  {categories.slice(0, 10).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                      style={{ color: "rgba(44,35,32,0.55)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(44,35,32,0.04)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: BLUSH, opacity: 0.5 }} />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {user?.role === "admin" && (
                <div className="pt-3" style={{ borderTop: "1px solid rgba(44,35,32,0.08)", marginTop: "8px" }}>
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: BLUSH, background: "rgba(196,122,128,0.06)" }}
                  >
                    <Settings size={17} style={{ color: BLUSH }} />
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </nav>

            <div className="p-4" style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}>
              <p className="text-xs text-center" style={{ color: "rgba(44,35,32,0.3)" }}>
                Yehovah Boutique © {new Date().getFullYear()}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
