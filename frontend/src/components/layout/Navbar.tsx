import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, User, LogOut, Settings, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useState, useRef, useEffect } from "react";

const DARK = "#2c2320";
const BLUSH = "#c47a80";

const NAV_LINKS = [
  { label: "New Arrivals", href: "/shop?category=new-arrivals" },
  { label: "Dresses",      href: "/shop?category=dresses" },
  { label: "Kurtis",       href: "/shop?category=kurtis" },
  { label: "Co-ords",      href: "/shop?category=co-ord-sets" },
  { label: "Ethnic Wear",  href: "/shop?category=ethnic-wear" },
  { label: "Sale",         href: "/shop?category=sale" },
];

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
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(253,248,243,0.97)" : "rgba(253,248,243,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(44,35,32,0.1)" : "1px solid rgba(44,35,32,0.05)",
        boxShadow: scrolled ? "0 2px 20px rgba(44,35,32,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Left — hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl transition-colors"
            style={{ color: "rgba(44,35,32,0.5)" }}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}
            >
              <span className="text-white font-display font-bold text-sm">Y</span>
            </div>
            <span className="font-display font-semibold text-lg tracking-wide hidden sm:block"
              style={{ color: DARK, letterSpacing: "0.04em" }}>
              Yehovah <span style={{ color: BLUSH }}>Boutique</span>
            </span>
          </Link>
        </div>

        {/* Center — nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{ color: "rgba(44,35,32,0.65)", letterSpacing: "0.02em" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = DARK;
                (e.currentTarget as HTMLElement).style.background = "rgba(44,35,32,0.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.65)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — icons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-xl transition-colors"
            style={{ color: "rgba(44,35,32,0.55)" }}
            aria-label="Search"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = DARK}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.55)"}
          >
            <Search size={18} />
          </button>

          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="p-2.5 rounded-xl transition-colors"
              style={{ color: "rgba(44,35,32,0.55)" }}
              aria-label="Wishlist"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = BLUSH}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.55)"}
            >
              <Heart size={18} />
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            className="relative p-2.5 rounded-xl transition-colors"
            style={{ color: "rgba(44,35,32,0.55)" }}
            aria-label="Cart"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = DARK}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.55)"}
          >
            <ShoppingBag size={18} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: BLUSH, color: "white" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {isAuthenticated ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-black/5 transition-all"
                aria-label="Account"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl p-1.5"
                    style={{
                      background: "white",
                      border: "1px solid rgba(44,35,32,0.1)",
                      boxShadow: "0 12px 40px rgba(44,35,32,0.12)",
                    }}
                  >
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid rgba(44,35,32,0.08)" }}>
                      <p className="text-sm font-semibold truncate" style={{ color: DARK }}>{user?.name}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(44,35,32,0.45)" }}>{user?.email}</p>
                    </div>
                    {[
                      { to: "/profile", icon: <User size={14} />,    label: "Profile" },
                      { to: "/orders",  icon: <Package size={14} />, label: "My Orders" },
                      ...(user?.role === "admin"
                        ? [{ to: "/admin", icon: <Settings size={14} />, label: "Admin Dashboard" }]
                        : []),
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors"
                        style={{ color: "rgba(44,35,32,0.65)" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(44,35,32,0.05)";
                          (e.currentTarget as HTMLElement).style.color = DARK;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.65)";
                        }}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="mt-1 pt-1" style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}>
                      <button
                        onClick={() => { logout(); navigate("/"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors"
                        style={{ color: "#c47a80" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(196,122,128,0.08)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="ml-1 btn-primary px-4 py-2 text-sm rounded-xl"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
