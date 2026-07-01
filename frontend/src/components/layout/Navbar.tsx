import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, Sparkles, User, LogOut, Settings, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount, setOpen } = useCartStore();
  const { setSearchOpen, toggleSidebar } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const cartCount = getItemCount();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(21,15,8,0.92)" : "rgba(13,10,7,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(252,203,6,0.15)" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 30px rgba(0,0,0,0.6)" : "none",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}
            className="p-2 rounded-xl transition-colors hover:bg-cream-50/8"
            style={{ color: "rgba(196,168,130,0.6)" }} aria-label="Menu">
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c99600, #FCCB06)" }}>
              <Sparkles size={15} style={{ color: "#0d0a07" }} />
            </div>
            <span className="font-display font-bold text-xl text-cream-100">
              Aura<span className="text-gold-gradient">Cart</span>
            </span>
          </Link>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Shop", href: "/shop" },
            { label: "Collections", href: "/collections" },
            { label: "Brands", href: "/shop?sort=brand" },
          ].map(link => (
            <Link key={link.href} to={link.href}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-cream-50/8"
              style={{ color: "rgba(196,168,130,0.65)" }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-xl transition-colors hover:bg-cream-50/8"
            style={{ color: "rgba(196,168,130,0.6)" }} aria-label="Search">
            <Search size={18} />
          </button>
          {isAuthenticated && (
            <Link to="/wishlist" className="p-2.5 rounded-xl transition-colors hover:bg-cream-50/8"
              style={{ color: "rgba(196,168,130,0.6)" }} aria-label="Wishlist">
              <Heart size={18} />
            </Link>
          )}
          <button onClick={() => setOpen(true)}
            className="relative p-2.5 rounded-xl transition-colors hover:bg-cream-50/8"
            style={{ color: "rgba(196,168,130,0.6)" }} aria-label="Cart">
            <ShoppingBag size={18} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: "#FCCB06", color: "#0d0a07" }}>
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {isAuthenticated ? (
            <div className="relative ml-1" ref={menuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-cream-50/8 transition-all">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #c99600, #FCCB06)", color: "#0d0a07" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl p-1.5 shadow-card"
                    style={{ background: "#1e160d", border: "1px solid rgba(252,203,6,0.15)" }}>
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid rgba(252,203,6,0.1)" }}>
                      <p className="text-sm font-semibold text-cream-100 truncate">{user?.name}</p>
                      <p className="text-xs text-cream-400 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: "/profile", icon: <User size={14} />, label: "Profile" },
                      { to: "/orders",  icon: <Package size={14} />, label: "My Orders" },
                      ...(user?.role === "admin" ? [{ to: "/admin", icon: <Settings size={14} />, label: "Admin Dashboard" }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors hover:bg-cream-50/8"
                        style={{ color: "rgba(196,168,130,0.7)" }}>
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="mt-1 pt-1" style={{ borderTop: "1px solid rgba(252,203,6,0.1)" }}>
                      <button onClick={() => { logout(); navigate("/"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors hover:bg-red-500/10"
                        style={{ color: "#f87171" }}>
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth/login" className="ml-1 btn-primary px-4 py-2 text-sm rounded-xl">Sign in</Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
