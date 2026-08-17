import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Star, Shield, Truck,
  Users, Package, ChevronDown, Play,
  Instagram, Heart, RefreshCw
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { toINR } from "@/lib/currency";
import MasonryCollections from "@/components/ui/MasonryCollections";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#fdf8f3";

/* ── Animated counter ──────────────────────────────────────────────────── */
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

/* ── Marquee ──────────────────────────────────────────────────────────── */
function Marquee({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="inline-flex gap-12"
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs font-medium"
            style={{ color: "rgba(44,35,32,0.55)" }}>
            <span style={{ color: BLUSH }}>✦</span> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Live Testing Panel ───────────────────────────────────────────────── */
function LiveTestingPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const accounts = [
    { role: "Admin", email: "admin@auracart.com", password: "admin123", color: BLUSH, desc: "Full dashboard access", icon: "🛡️" },
    { role: "User",  email: "user@auracart.com",  password: "user123",  color: "#b88400", desc: "Shopping experience", icon: "🛍️" },
  ];

  const loginAs = async (acc: typeof accounts[0]) => {
    setLoading(acc.role); setError(null);
    try {
      const { data } = await api.post("/auth/login", { email: acc.email, password: acc.password });
      setAuth(data.data.user, data.data.token);
      setOpen(false);
      navigate(data.data.user.role === "admin" ? "/admin" : "/shop");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Is the backend running?");
    } finally { setLoading(null); }
  };

  const logout = () => { useAuthStore.getState().logout(); navigate("/"); };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#166534,#15803d)", boxShadow: "0 4px 20px rgba(22,163,74,0.45)" }}
      >
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-300"
        />
        {isAuthenticated ? `Signed in as ${user?.role}` : "Live Testing"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(44,35,32,0.6)", backdropFilter: "blur(8px)" }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-6 left-5 z-50 w-80 rounded-3xl overflow-hidden"
              style={{
                background: "white",
                border: "1px solid rgba(44,35,32,0.12)",
                boxShadow: "0 20px 60px rgba(44,35,32,0.2)",
              }}
            >
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg,#2c2320,#402a22)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Live Testing Panel</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>One-click instant login</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-lg leading-none">
                  ×
                </button>
              </div>

              {isAuthenticated && (
                <div className="mx-4 mt-4 p-3 rounded-2xl flex items-center justify-between"
                  style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#c47a80,#d4909a)" }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600">Signed in</p>
                      <p className="text-[10px]" style={{ color: "rgba(44,35,32,0.5)" }}>{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                    Sign out
                  </button>
                </div>
              )}

              <div className="p-4 space-y-3">
                {accounts.map(acc => (
                  <div key={acc.role} className="rounded-2xl p-4"
                    style={{ background: "rgba(44,35,32,0.03)", border: "1px solid rgba(44,35,32,0.08)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{acc.icon}</span>
                      <div>
                        <span className="text-xs font-bold" style={{ color: acc.color }}>{acc.role}</span>
                        <p className="text-[10px]" style={{ color: "rgba(44,35,32,0.5)" }}>{acc.desc}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {[{ label: "Email", val: acc.email }, { label: "Password", val: acc.password }].map(f => (
                        <div key={f.label} className="flex items-center justify-between px-3 py-2 rounded-xl"
                          style={{ background: "rgba(44,35,32,0.04)", border: "1px solid rgba(44,35,32,0.06)" }}>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(44,35,32,0.4)" }}>{f.label}</p>
                            <p className="text-xs font-medium" style={{ color: DARK }}>{f.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => loginAs(acc)} disabled={loading === acc.role}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 text-white"
                      style={{
                        background: loading === acc.role ? "rgba(44,35,32,0.2)" : acc.color,
                        boxShadow: loading !== acc.role ? `0 4px 16px ${acc.color}35` : "none",
                      }}>
                      {loading === acc.role ? (
                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>Signing in...</>
                      ) : (
                        <><Play size={13} fill="currentColor" />Sign in as {acc.role}</>
                      )}
                    </button>
                  </div>
                ))}
                {error && (
                  <div className="px-3 py-2.5 rounded-xl text-xs text-red-500"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>
              <div className="px-5 pb-4">
                <p className="text-[10px] text-center" style={{ color: "rgba(44,35,32,0.3)" }}>
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

/* ── Testimonials data ────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The quality of the fabrics is simply outstanding. My Rosewood Anarkali received so many compliments at my cousin's wedding!",
    avatar: "P",
  },
  {
    name: "Anika Reddy",
    location: "Hyderabad",
    rating: 5,
    text: "I love how the website feels — it's so elegant and easy to use. Found my perfect co-ord set within minutes.",
    avatar: "A",
  },
  {
    name: "Meera Nair",
    location: "Kochi",
    rating: 5,
    text: "The Beige Elegance Saree exceeded all my expectations. Delivery was prompt and packaging was beautiful.",
    avatar: "M",
  },
];

/* ── Gallery images ───────────────────────────────────────────────────── */
const GALLERY = [
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4ef5?w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
  "https://images.unsplash.com/photo-1617627143233-c0db46d1c4db?w=400&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80",
];

/* ── Main Landing Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: featured } = useFeaturedProducts();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const marqueeItems = [
    "Free Shipping Over ₹999",
    "Easy 30-Day Returns",
    "100% Authentic Fabric",
    "New Arrivals Every Week",
    "Exclusive Members-Only Deals",
    "Sustainably Sourced Materials",
  ];

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: CREAM }}>
      <LiveTestingPanel />

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 120% 100% at 65% 40%, #f5ede3 0%, #fdf4ec 45%, #f9f4ef 100%)" }} />
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=40)`,
              backgroundSize: "cover", backgroundPosition: "center right",
              filter: "blur(3px) saturate(0.5) brightness(1.1)",
            }} />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 100% 100% at 100% 50%, transparent 30%, rgba(249,244,239,0.95) 75%)" }} />
          {/* Decorative blush blobs */}
          <motion.div
            animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.08, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute rounded-full blur-[120px]"
            style={{ width: 500, height: 500, left: "55%", top: "-10%", background: "rgba(196,122,128,0.25)" }}
          />
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 13, repeat: Infinity, delay: 3 }}
            className="absolute rounded-full blur-[100px]"
            style={{ width: 400, height: 400, right: "-5%", bottom: "10%", background: "rgba(184,132,0,0.15)" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: "rgba(196,122,128,0.1)", border: "1px solid rgba(196,122,128,0.25)" }}
              >
                <Sparkles size={12} style={{ color: BLUSH }} />
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                  style={{ color: BLUSH }}>
                  New Arrivals — Summer Edit 2026
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="font-display leading-tight mb-5"
                style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: DARK }}
              >
                Elegance,{" "}
                <em style={{ color: BLUSH }}>Curated</em>
                <br />for You
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="text-base mb-8 max-w-md leading-relaxed"
                style={{ color: "rgba(44,35,32,0.6)" }}
              >
                Discover Yehovah Boutique — where premium Indian craftsmanship meets contemporary
                fashion. From ethereal sarees to chic western wear, every piece tells a story.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="flex flex-wrap gap-3"
              >
                <Link to="/collections" className="btn-primary flex items-center gap-2 px-7 py-3.5 text-sm rounded-2xl">
                  Shop Collection <ArrowRight size={15} />
                </Link>
                <Link to="/shop?category=new-arrivals" className="btn-outline flex items-center gap-2 px-7 py-3.5 text-sm rounded-2xl">
                  New Arrivals
                </Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 mt-10 pt-8"
                style={{ borderTop: "1px solid rgba(44,35,32,0.1)" }}
              >
                {[
                  { val: "500+", label: "Styles" },
                  { val: "4.9★", label: "Rating" },
                  { val: "50K+", label: "Happy Customers" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-xl font-display font-semibold" style={{ color: DARK }}>{s.val}</div>
                    <div className="text-xs" style={{ color: "rgba(44,35,32,0.45)" }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — hero image collage */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
              style={{ height: "580px" }}
            >
              {/* Main image */}
              <div className="absolute right-0 top-0 w-72 h-96 rounded-3xl overflow-hidden shadow-boutique-hover">
                <img
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4b4ef5?w=600&q=80"
                  alt="Fashion model in elegant dress"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Secondary image */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 bottom-12 w-52 h-72 rounded-2xl overflow-hidden shadow-boutique-hover"
              >
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80"
                  alt="Ethnic wear collection"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* Floating product badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
                className="absolute left-20 top-10 rounded-2xl p-3 shadow-boutique"
                style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ background: "#f0e8e0" }}>
                    <img
                      src="https://images.unsplash.com/photo-1617627143233-c0db46d1c4db?w=80&q=80"
                      alt="Kurta" className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: DARK }}>Rosewood Anarkali</p>
                    <p className="text-xs" style={{ color: BLUSH }}>₹2,490</p>
                  </div>
                </div>
              </motion.div>
              {/* Star rating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 2.5 }}
                className="absolute right-4 bottom-28 rounded-2xl px-4 py-3 shadow-boutique"
                style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}
              >
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} fill={BLUSH} style={{ color: BLUSH }} />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: "rgba(44,35,32,0.5)" }}>4.9 · 2,300 reviews</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: "rgba(44,35,32,0.3)" }}
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="py-3.5"
        style={{
          background: "linear-gradient(135deg, #2c2320, #402a22)",
          borderTop: "1px solid rgba(196,122,128,0.2)",
          borderBottom: "1px solid rgba(196,122,128,0.2)",
        }}
      >
        <Marquee items={marqueeItems.map(i => `<span style="color:rgba(255,255,255,0.6)">${i}</span>`) as any} />
        {/* Render plain */}
        <div className="overflow-hidden whitespace-nowrap">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="inline-flex gap-12"
          >
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-xs font-medium text-white/60">
                <span className="text-white/30">✦</span> {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-16 px-6" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 500,  suffix: "+",  label: "Premium Styles",   icon: <Package size={20} /> },
            { value: 12,   suffix: "",   label: "Collections",      icon: <Sparkles size={20} /> },
            { value: 50,   suffix: "K+", label: "Happy Customers",  icon: <Users size={20} /> },
            { value: 98,   suffix: "%",  label: "Satisfied Orders", icon: <Star size={20} /> },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300"
              style={{
                background: "white",
                border: "1px solid rgba(44,35,32,0.08)",
                boxShadow: "0 2px 12px rgba(44,35,32,0.05)",
              }}
            >
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(196,122,128,0.1)", color: BLUSH }}>
                {s.icon}
              </div>
              <div className="text-2xl font-display font-semibold mb-1" style={{ color: DARK }}>
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-16 px-6" style={{ background: "#fdf8f3" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-6" style={{ background: BLUSH }} />
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: BLUSH }}>
                  Just Dropped
                </p>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: DARK }}>
                New <em>Arrivals</em>
              </h2>
            </div>
            <Link
              to="/shop?category=new-arrivals"
              className="hidden sm:flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "rgba(44,35,32,0.5)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = BLUSH}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.5)"}
            >
              View all <ArrowRight size={14} />
            </Link>
          </motion.div>

          {featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/products/${product.slug}`}
                    className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "white",
                      border: "1px solid rgba(44,35,32,0.08)",
                      boxShadow: "0 2px 12px rgba(44,35,32,0.05)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(44,35,32,0.1)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,122,128,0.3)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(44,35,32,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,35,32,0.08)";
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden"
                      style={{ background: "#f0e8e0" }}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={32} style={{ color: "rgba(44,35,32,0.15)" }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          View Details →
                        </span>
                      </div>
                      {product.isFeatured && (
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                            style={{ background: BLUSH }}>NEW</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      {product.brand && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                          style={{ color: BLUSH }}>{product.brand}</p>
                      )}
                      <p className="text-sm font-medium line-clamp-1 mb-1.5 group-hover:text-black transition-colors"
                        style={{ color: DARK }}>{product.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: DARK }}>{toINR(product.price)}</span>
                        {product.reviewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Star size={10} fill={BLUSH} style={{ color: BLUSH }} />
                            <span className="text-[10px]" style={{ color: "rgba(44,35,32,0.45)" }}>{product.rating}</span>
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
                <div key={i} className="rounded-2xl overflow-hidden bg-white">
                  <div className="aspect-[3/4] shimmer" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 shimmer rounded" />
                    <div className="h-4 shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #2c2320 0%, #5c3d32 50%, #2c2320 100%)",
              minHeight: "280px",
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=40)`,
                backgroundSize: "cover", backgroundPosition: "center",
                filter: "blur(1px)",
              }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(44,35,32,0.85), rgba(92,61,50,0.7))" }} />
            {/* Gold accents */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20"
              style={{ background: "#b88400" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px] opacity-15"
              style={{ background: "#c47a80" }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{ background: "rgba(196,122,128,0.2)", color: "#ebbfc5", border: "1px solid rgba(196,122,128,0.3)" }}>
                  <Sparkles size={11} /> Limited Time Offer
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-3">
                  Up to <span style={{ color: "#ebbfc5" }}>60% Off</span>
                  <br />on Sale Collection
                </h2>
                <p className="text-sm text-white/50 max-w-sm">
                  Shop our curated sale collection featuring premium dresses, kurtis, and ethnic wear at incredible prices.
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link to="/shop?category=sale"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #c47a80, #d4909a)",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(196,122,128,0.4)",
                  }}>
                  Shop the Sale <ArrowRight size={15} />
                </Link>
                <Link to="/collections"
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-sm font-medium text-white/70 border border-white/20 hover:bg-white/10 transition-all">
                  All Collections
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MASONRY COLLECTIONS ── */}
      <MasonryCollections />

      {/* ── FEATURED CATEGORIES GRID ── */}
      <section className="py-16 px-6" style={{ background: "#fdf8f3" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: BLUSH }}>
              Our Range
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: DARK }}>
              Shop by <em>Occasion</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: "Casual",    slug: "casual-wear",    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80", color: "#9a8070" },
              { label: "Ethnic",    slug: "ethnic-wear",    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&q=80", color: "#b88400" },
              { label: "Party",     slug: "party-wear",     img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&q=80", color: "#c47a80" },
              { label: "Festive",   slug: "ethnic-wear",    img: "https://images.unsplash.com/photo-1617627143233-c0db46d1c4db?w=300&q=80", color: "#d4a020" },
              { label: "Western",   slug: "western-wear",   img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&q=80", color: "#7a5548" },
            ].map((cat, i) => (
              <motion.div
                key={cat.slug + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group block text-center"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 transition-all duration-300 group-hover:-translate-y-1"
                    style={{ boxShadow: "0 4px 16px rgba(44,35,32,0.08)" }}>
                    <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="text-sm font-medium" style={{ color: DARK }}>{cat.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="py-12 px-6" style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Truck size={20} />,     title: "Free Shipping Over ₹999",    desc: "Fast & secure pan-India delivery" },
            { icon: <Shield size={20} />,    title: "100% Authentic",              desc: "Every piece quality-certified" },
            { icon: <RefreshCw size={20} />, title: "Easy 30-Day Returns",         desc: "Hassle-free return policy" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 flex items-start gap-4"
              style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,122,128,0.1)", color: BLUSH }}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: DARK }}>{f.title}</p>
                <p className="text-xs" style={{ color: "rgba(44,35,32,0.5)" }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6" style={{ background: "#fdf8f3" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: BLUSH }}>
              What Our Customers Say
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: DARK }}>
              Loved by <em>Women Everywhere</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: "white",
                  border: "1px solid rgba(44,35,32,0.08)",
                  boxShadow: "0 2px 12px rgba(44,35,32,0.05)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13} fill={s <= t.rating ? BLUSH : "none"} style={{ color: BLUSH }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(44,35,32,0.7)" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: DARK }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "rgba(44,35,32,0.45)" }}>{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM / GALLERY ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Instagram size={16} style={{ color: BLUSH }} />
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: BLUSH }}>
                @yehova.boutique
              </p>
            </div>
            <h2 className="font-display text-3xl font-semibold" style={{ color: DARK }}>
              Style <em>Gallery</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {GALLERY.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              >
                <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "rgba(44,35,32,0.4)" }}>
                  <Heart size={20} className="text-white" fill="white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-10 md:p-14"
            style={{
              background: "linear-gradient(135deg, #fdf0ec 0%, #f9f4ef 50%, #fdf0ec 100%)",
              border: "1px solid rgba(196,122,128,0.2)",
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-30"
              style={{ background: BLUSH }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                style={{ background: "rgba(196,122,128,0.1)", border: "1px solid rgba(196,122,128,0.2)" }}>
                <Sparkles size={12} style={{ color: BLUSH }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: BLUSH }}>
                  Stay in Style
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: DARK }}>
                Join the <em>Yehovah Circle</em>
              </h2>
              <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: "rgba(44,35,32,0.55)" }}>
                Get exclusive access to new arrivals, styling tips, and members-only offers delivered to your inbox.
              </p>
              {subscribed ? (
                <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                  ✓ Welcome to the Yehovah Circle!
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "white",
                      border: "1.5px solid rgba(44,35,32,0.15)",
                      color: DARK,
                    }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = BLUSH}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,35,32,0.15)"}
                    required
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-sm rounded-xl flex-shrink-0">
                    Subscribe <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6"
        style={{ background: "#2c2320", borderTop: "1px solid rgba(196,122,128,0.15)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                  <span className="text-white font-display font-bold text-base">Y</span>
                </div>
                <span className="font-display font-semibold text-xl text-white tracking-wide">
                  Yehovah <span style={{ color: "#ebbfc5" }}>Boutique</span>
                </span>
              </div>
              <p className="text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Curating premium women's fashion with a passion for elegance and craftsmanship.
                Every piece is chosen with love.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {["Instagram","Pinterest","Facebook"].map(s => (
                  <a key={s} href="#"
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = "#ebbfc5";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,122,128,0.4)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                    }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Collections */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-white/60">Collections</p>
              {["Dresses","Kurtis","Sarees","Co-ord Sets","Ethnic Wear","Western Wear"].map(l => (
                <Link key={l} to={`/shop?category=${l.toLowerCase().replace(/ /g, "-")}`}
                  className="block text-sm py-1 transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ebbfc5"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"}>
                  {l}
                </Link>
              ))}
            </div>

            {/* Help */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-white/60">Help</p>
              {["Size Guide","Shipping Policy","Return Policy","Track My Order","Contact Us","FAQs"].map(l => (
                <a key={l} href="#"
                  className="block text-sm py-1 transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ebbfc5"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} Yehovah Boutique. Made with ♥ in India.
            </p>
            <div className="flex gap-5">
              {["Privacy","Terms","Sitemap"].map(l => (
                <a key={l} href="#" className="text-xs transition-colors"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
