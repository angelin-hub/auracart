import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  ArrowRight, Sparkles, Star, Zap, Shield, Truck,
  TrendingUp, Users, Package, ChevronDown, Play
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { toINR } from "@/lib/currency";
import MasonryCollections from "@/components/ui/MasonryCollections";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

/* ── Animated counter ──────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60; const inc = to / steps; let cur = 0;
        const t = setInterval(() => {
          cur += inc;
          if (cur >= to) { setCount(to); clearInterval(t); }
          else setCount(Math.floor(cur));
        }, 2000 / steps);
      }
    });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ── Marquee ───────────────────────────────────────────────────────────────── */
function Marquee({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="inline-flex gap-10">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm text-cream-400 font-medium">
            <Sparkles size={11} className="text-gold-300" /> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Live Testing Panel — Real one-click login ──────────────────────────────── */
function LiveTestingPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const accounts = [
    { role: "Admin", email: "admin@auracart.com", password: "admin123", color: "#FCCB06", desc: "Full dashboard access", icon: "🛡️" },
    { role: "User",  email: "user@auracart.com",  password: "user123",  color: "#c4a882", desc: "Shopping experience",  icon: "🛍️" },
  ];

  const loginAs = async (acc: typeof accounts[0]) => {
    setLoading(acc.role);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email: acc.email, password: acc.password });
      setAuth(data.data.user, data.data.token);
      setOpen(false);
      // Navigate based on role
      if (data.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/shop");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Is the backend running?");
    } finally {
      setLoading(null);
    }
  };

  const logout = () => {
    useAuthStore.getState().logout();
    navigate("/");
  };

  return (
    <>
      {/* FAB */}
      <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#166534,#15803d)", boxShadow: "0 4px 20px rgba(22,163,74,0.45)" }}>
        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-300" />
        {isAuthenticated ? `Signed in as ${user?.role}` : "Live Testing"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
              onClick={() => setOpen(false)} />

            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-6 left-5 z-50 w-80 rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#1e160d,#150f08)", border: "1px solid rgba(252,203,6,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(252,203,6,0.08)" }}>

              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: "rgba(252,203,6,0.07)", borderBottom: "1px solid rgba(252,203,6,0.12)" }}>
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <div>
                    <p className="text-sm font-bold text-cream-100">Live Testing Panel</p>
                    <p className="text-[10px] text-cream-400">One-click instant login</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-white/10 transition-all text-lg leading-none">
                  ×
                </button>
              </div>

              {/* Currently signed in status */}
              {isAuthenticated && (
                <div className="mx-4 mt-4 p-3 rounded-2xl flex items-center justify-between"
                  style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg,#c99600,#FCCB06)", color: "#0d0a07" }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-400">Currently signed in</p>
                      <p className="text-[10px] text-cream-400">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={logout}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all text-red-400 hover:bg-red-500/10">
                    Sign out
                  </button>
                </div>
              )}

              {/* Account cards */}
              <div className="p-4 space-y-3">
                {accounts.map(acc => (
                  <div key={acc.role} className="rounded-2xl p-4"
                    style={{ background: `${acc.color}08`, border: `1px solid ${acc.color}20` }}>
                    {/* Role badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{acc.icon}</span>
                        <div>
                          <span className="text-xs font-bold" style={{ color: acc.color }}>{acc.role}</span>
                          <p className="text-[10px] text-cream-400">{acc.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Credentials display */}
                    <div className="space-y-1.5 mb-3">
                      {[
                        { label: "Email",    val: acc.email },
                        { label: "Password", val: acc.password },
                      ].map(f => (
                        <div key={f.label} className="flex items-center justify-between px-3 py-2 rounded-xl"
                          style={{ background: "rgba(253,248,242,0.04)", border: "1px solid rgba(253,248,242,0.06)" }}>
                          <div>
                            <p className="text-[9px] text-cream-400 uppercase tracking-wider">{f.label}</p>
                            <p className="text-xs font-medium text-cream-200">{f.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ONE-CLICK LOGIN BUTTON */}
                    <button
                      onClick={() => loginAs(acc)}
                      disabled={loading === acc.role}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                      style={{
                        background: loading === acc.role ? `${acc.color}30` : `linear-gradient(135deg, ${acc.color}, ${acc.color}cc)`,
                        color: "#0d0a07",
                        boxShadow: loading !== acc.role ? `0 4px 16px ${acc.color}35` : "none",
                      }}>
                      {loading === acc.role ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Play size={13} fill="currentColor" />
                          Sign in as {acc.role}
                        </>
                      )}
                    </button>
                  </div>
                ))}

                {/* Error */}
                {error && (
                  <div className="px-3 py-2.5 rounded-xl text-xs text-red-400"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-4">
                <p className="text-[10px] text-cream-400/40 text-center">
                  Real accounts · Full functionality · No limitations
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: featured } = useFeaturedProducts();
  const heroRef = useRef<HTMLDivElement>(null);
  useScroll({ target: heroRef, offset: ["start start", "end start"] }); // scroll hook kept for future parallax

  const marqueeItems = [
    "Free Delivery Over ₹8,300", "30-Day Returns", "100% Authentic",
    "231 Premium Products", "20 Collections", "AI-Powered Shopping",
    "Secure Payments", "Same Day Dispatch",
  ];

  // floatCards reserved for future animated card positions
  // const floatCards = [{ x: "62%", y: "12%", delay: 0.3 }, ...];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#0d0a07" }}>
      <LiveTestingPanel />

      {/* ════════════════════════════════════════════════════════════════
          CINEMATIC HERO — Video showcase card + floating luxury UI
      ════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">

        {/* ── Background layers ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep warm base */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 110% 90% at 50% 40%, #1e1208 0%, #120b05 50%, #0d0a07 100%)" }} />

          {/* Soft blurred boutique bg */}
          <div className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=50)`,
              backgroundSize: "cover", backgroundPosition: "center top",
              filter: "blur(6px) saturate(0.3) brightness(0.35)",
            }} />

          {/* Dark vignette */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 140% 110% at 50% 50%, transparent 20%, #0d0a07 100%)" }} />

          {/* Gold glow — left */}
          <motion.div animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.1, 1] }}
            transition={{ duration: 9, repeat: Infinity }}
            className="absolute rounded-full blur-[160px]"
            style={{ width: 700, height: 700, left: "-15%", top: "-10%", background: "rgba(201,150,0,0.22)" }} />

          {/* Gold glow — right */}
          <motion.div animate={{ opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 11, repeat: Infinity, delay: 4 }}
            className="absolute rounded-full blur-[120px]"
            style={{ width: 500, height: 500, right: "-5%", bottom: "-5%", background: "rgba(139,106,58,0.18)" }} />

          {/* Ambient centre glow */}
          <motion.div animate={{ opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            className="absolute rounded-full blur-[100px]"
            style={{ width: 800, height: 400, left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "rgba(180,130,0,0.14)" }} />

          {/* Floating particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{
                width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                background: Math.random() > 0.5 ? "rgba(252,203,6,0.5)" : "rgba(196,168,130,0.35)",
              }}
              animate={{ opacity: [0, 0.8, 0], y: [0, -40, 0] }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }} />
          ))}

          {/* Gold rim line top */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(252,203,6,0.4) 50%, transparent 100%)" }} />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header text */}
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
              style={{ background: "rgba(252,203,6,0.08)", border: "1px solid rgba(252,203,6,0.22)" }}>
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[11px] font-semibold tracking-[0.15em] text-cream-300 uppercase">
                231 Products · 20 Collections · Live
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-display font-bold leading-tight mb-4">
              <span className="block text-5xl sm:text-6xl md:text-7xl text-cream-100 tracking-tight">AuraCart</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl font-display italic mt-2"
                style={{ color: "rgba(196,168,130,0.75)" }}>
                Shop the Finest Things in Life
              </span>
            </motion.h1>
          </div>

          {/* VIDEO CARD ROW */}
          <div className="relative flex items-center justify-center gap-4 xl:gap-6">

            {/* Left floating cards */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden xl:flex flex-col gap-4 flex-shrink-0">
              {featured?.slice(0, 2).map((p, i) => (
                <motion.div key={p.id} animate={{ y: [0, i % 2 === 0 ? -10 : -14, 0] as any }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                  className="glass-card rounded-2xl p-3 w-44 shadow-card">
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-2" style={{ background: "#1e160d" }}>
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1.5 inline-block"
                    style={{ background: "rgba(252,203,6,0.15)", color: "#FCCB06", border: "1px solid rgba(252,203,6,0.25)" }}>
                    {i === 0 ? "✨ New Arrival" : "🤖 AI Pick"}
                  </span>
                  <p className="text-xs font-semibold text-cream-100 truncate">{p.name}</p>
                  <p className="text-xs font-bold mt-1 text-gold-gradient">{toINR(p.price)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={9} className="fill-gold-300 text-gold-300" />
                    <span className="text-[10px] text-cream-400">{p.rating}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* MAIN VIDEO CARD */}
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-shrink-0 w-full" style={{ maxWidth: "860px" }}>
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ transform: "scale(1.08) translateY(4%)", background: "linear-gradient(135deg,rgba(201,150,0,0.35),rgba(139,106,58,0.2))", filter: "blur(40px)", zIndex: -1 }} />
              {/* Border glow */}
              <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-[1px] rounded-3xl pointer-events-none"
                style={{ background: "linear-gradient(135deg,rgba(252,203,6,0.5),rgba(139,106,58,0.2),rgba(252,203,6,0.4))", zIndex: -1 }} />
              {/* Glass card */}
              <div className="relative rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(135deg,rgba(40,28,12,0.9),rgba(20,14,6,0.95))", border: "1px solid rgba(252,203,6,0.25)", boxShadow: "0 30px 80px rgba(0,0,0,0.7),0 0 60px rgba(201,150,0,0.15),inset 0 1px 0 rgba(252,203,6,0.15)" }}>
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3"
                  style={{ background: "linear-gradient(135deg,rgba(252,203,6,0.08),rgba(139,106,58,0.04))", borderBottom: "1px solid rgba(252,203,6,0.1)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#c99600,#FCCB06)" }}>
                      <Sparkles size={12} style={{ color: "#0d0a07" }} />
                    </div>
                    <span className="font-display font-bold text-sm text-cream-100">AuraCart</span>
                    <span className="text-[10px] text-cream-400">· Premium Collection 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[10px] text-cream-400 font-medium">LIVE</span>
                  </div>
                </div>
                {/* Video */}
                <div className="relative" style={{ aspectRatio: "16/9" }}>
                  <video autoPlay muted loop playsInline className="w-full h-full object-cover" style={{ display: "block" }}>
                    <source src="/auracart-promo.mp4" type="video/mp4" />
                    <source src="https://cdn.coverr.co/videos/coverr-luxurious-fashion-shopping-3736/1080p.mp4" type="video/mp4" />
                  </video>
                  {/* Video vignette */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 110% 110% at 50% 50%,transparent 55%,rgba(13,10,7,0.6) 100%)" }} />
                  {/* Badge — top-left */}
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-4 left-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(252,203,6,0.15)", border: "1px solid rgba(252,203,6,0.4)", color: "#FCCB06", backdropFilter: "blur(12px)" }}>
                      <Sparkles size={11} /> Luxury Collection
                    </div>
                  </motion.div>
                  {/* Badge — top-right */}
                  <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80", backdropFilter: "blur(12px)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> New Arrival
                    </div>
                  </motion.div>
                  {/* Badge — bottom-left */}
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c084fc", backdropFilter: "blur(12px)" }}>
                      🤖 AI Recommended
                    </div>
                  </motion.div>
                </div>
                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4"
                  style={{ background: "linear-gradient(135deg,rgba(252,203,6,0.05),rgba(139,106,58,0.03))", borderTop: "1px solid rgba(252,203,6,0.1)" }}>
                  <div className="flex items-center gap-5">
                    {[{ n: "231+", l: "Products" }, { n: "20", l: "Collections" }, { n: "4.8★", l: "Rating" }].map(s => (
                      <div key={s.l} className="text-center">
                        <div className="text-sm font-bold text-gold-gradient">{s.n}</div>
                        <div className="text-[10px] text-cream-400">{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Link to="/collections" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl">
                      Explore Collections <ArrowRight size={14} />
                    </Link>
                    <Link to="/shop" className="btn-outline flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl">
                      <Zap size={13} style={{ color: "#FCCB06" }} /> Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right floating cards */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="hidden xl:flex flex-col gap-4 flex-shrink-0">
              {featured?.slice(2, 4).map((p, i) => (
                <motion.div key={p.id} animate={{ y: [0, i % 2 === 0 ? -12 : -8, 0] as any }}
                  transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
                  className="glass-card rounded-2xl p-3 w-44 shadow-card">
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-2" style={{ background: "#1e160d" }}>
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1.5 inline-block"
                    style={{ background: "rgba(252,203,6,0.15)", color: "#FCCB06", border: "1px solid rgba(252,203,6,0.25)" }}>
                    💎 Luxury Collection
                  </span>
                  <p className="text-xs font-semibold text-cream-100 truncate">{p.name}</p>
                  <p className="text-xs font-bold mt-1 text-gold-gradient">{toINR(p.price)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={9} className="fill-gold-300 text-gold-300" />
                    <span className="text-[10px] text-cream-400">{p.rating}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Description + mobile CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center mt-8">
            <p className="text-sm text-cream-400/60 max-w-lg mx-auto mb-6 leading-relaxed">
              Discover premium fashion, luxury accessories, cutting-edge technology<br className="hidden sm:block" />
              and AI-powered shopping — all in one beautiful experience.
            </p>
            <div className="flex sm:hidden items-center justify-center gap-3">
              <Link to="/collections" className="btn-primary flex items-center gap-2 px-6 py-3 text-sm rounded-2xl">
                Explore <ArrowRight size={14} />
              </Link>
              <Link to="/shop" className="btn-outline flex items-center gap-2 px-6 py-3 text-sm rounded-2xl">
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: "rgba(196,168,130,0.35)" }}>
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #0d0a07)" }} />
      </section>

      {/* ── GOLD TICKER ── */}
      <div className="py-3" style={{ background: "linear-gradient(135deg, #150f08, #1e160d, #150f08)", borderTop: "1px solid rgba(252,203,6,0.15)", borderBottom: "1px solid rgba(252,203,6,0.15)" }}>
        <Marquee items={marqueeItems} />
      </div>

      {/* ── STATS ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 231, suffix: "+", label: "Premium Products", icon: <Package size={20} /> },
            { value: 20,  suffix: "",  label: "Collections",       icon: <Sparkles size={20} /> },
            { value: 50,  suffix: "K+",label: "Happy Shoppers",    icon: <Users size={20} /> },
            { value: 98,  suffix: "%", label: "Satisfaction",      icon: <Star size={20} /> },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(252,203,6,0.1)", color: "#FCCB06" }}>{s.icon}</div>
              <div className="text-3xl font-bold text-gold-gradient mb-1">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-cream-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-gold-gradient">AI Curated</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-100">
                Featured <span className="text-gold-gradient">Pieces</span>
              </h2>
            </div>
            <Link to="/collections" className="hidden sm:flex items-center gap-2 text-sm text-cream-400 hover:text-gold-300 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </motion.div>

          {featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((product, i) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <Link to={`/products/${product.slug}`}
                    className="group block glass-card-hover rounded-2xl overflow-hidden">
                    <div className="relative aspect-square overflow-hidden"
                      style={{ background: "#1e160d" }}>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={32} className="text-cream-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-xs font-medium text-cream-100 glass-card px-2.5 py-1 rounded-full">
                          View Product →
                        </span>
                      </div>
                      {product.isFeatured && (
                        <div className="absolute top-2.5 left-2.5">
                          <span className="badge-gold text-[10px]">FEATURED</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      {product.brand && (
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gold-gradient">{product.brand}</p>
                      )}
                      <p className="text-sm font-semibold text-cream-200 line-clamp-1 mb-2 group-hover:text-cream-50 transition-colors">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-cream-100">{toINR(product.price)}</span>
                        {product.reviewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Star size={10} className="fill-gold-300 text-gold-300" />
                            <span className="text-[10px] text-cream-400">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-square shimmer" />
                  <div className="p-3 space-y-2"><div className="h-3 shimmer rounded" /><div className="h-4 shimmer rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MASONRY COLLECTIONS GALLERY ── */}
      <MasonryCollections />

      {/* ── VALUE PROPS ── */}
      <section className="py-16 px-6" style={{ borderTop: "1px solid rgba(252,203,6,0.1)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Truck size={20} />, title: "Free Delivery Over ₹8,300", desc: "Fast & secure shipping across India" },
            { icon: <Shield size={20} />, title: "100% Authentic", desc: "Every product certified and verified" },
            { icon: <TrendingUp size={20} />, title: "30-Day Returns", desc: "Hassle-free return policy" },
          ].map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(252,203,6,0.1)", color: "#FCCB06" }}>{f.icon}</div>
              <div>
                <p className="font-semibold text-cream-100 text-sm mb-0.5">{f.title}</p>
                <p className="text-xs text-cream-400">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center glass-card">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] opacity-20" style={{ background: "#FCCB06" }} />
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-[60px] opacity-10" style={{ background: "#c99600" }} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(252,203,6,0.4), transparent)" }} />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: "rgba(252,203,6,0.1)", border: "1px solid rgba(252,203,6,0.25)" }}>
                <Sparkles size={13} style={{ color: "#FCCB06" }} />
                <span className="text-xs tracking-widest text-cream-300">AI-POWERED LUXURY SHOPPING</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-cream-100 mb-4 leading-tight">
                Your Perfect Product is{" "}
                <span className="text-gold-gradient">One Chat Away</span>
              </h2>
              <p className="text-cream-400 mb-8 max-w-xl mx-auto">
                Ask AuraBot — "best gaming headset under ₹20,000" or "gift ideas for dad" — and get instant personalised recommendations from 231 products.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth/register" className="btn-primary flex items-center gap-2 px-8 py-4 text-base rounded-2xl">
                  Create Free Account <ArrowRight size={17} />
                </Link>
                <Link to="/collections" className="btn-outline flex items-center gap-2 px-8 py-4 text-base rounded-2xl">
                  Browse Collections
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid rgba(252,203,6,0.1)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c99600, #FCCB06)" }}>
              <Sparkles size={13} style={{ color: "#0d0a07" }} />
            </div>
            <span className="font-display font-bold text-cream-100">
              Aura<span className="text-gold-gradient">Cart</span>
            </span>
          </div>
          <p className="text-xs text-cream-400/50">© {new Date().getFullYear()} AuraCart. Built with ❤️ in India.</p>
          <div className="flex gap-5">
            {["Privacy","Terms","Support"].map(l => (
              <a key={l} href="#" className="text-xs text-cream-400/40 hover:text-cream-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
