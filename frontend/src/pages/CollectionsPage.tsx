import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, SlidersHorizontal, Heart, ShoppingBag, Star, Sparkles,
  ArrowRight, X, Eye, TrendingUp, Clock, Zap, Grid3X3, ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import type { Product } from "@/types";
import { toINR } from "@/lib/currency";

// ── Collection banner config — all 20 categories ─────────────────────────────
const COLLECTION_BANNERS = [
  { slug:"new-arrivals",    label:"New Arrivals",     tagline:"Just Dropped This Week",          desc:"The freshest products landing in our store every single week.", gradient:"from-violet-900/80 via-purple-900/60 to-aura-950/90", accent:"#c084fc", image:"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",   badge:"Just In" },
  { slug:"trending",        label:"Trending Now",     tagline:"Everyone's Talking About",        desc:"The most-wanted products right now, curated by real buyers.", gradient:"from-rose-900/80 via-pink-900/60 to-aura-950/90",   accent:"#fb7185", image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",   badge:"🔥 Hot Right Now" },
  { slug:"best-sellers",    label:"Best Sellers",     tagline:"Loved by Thousands",              desc:"Top-rated products with thousands of five-star reviews.", gradient:"from-amber-900/80 via-yellow-900/60 to-aura-950/90",  accent:"#fbbf24", image:"https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1400&q=80",   badge:"★ Top Rated" },
  { slug:"electronics",     label:"Electronics",      tagline:"Intelligence Meets Design",       desc:"Premium tech that looks as good as it performs.", gradient:"from-slate-900/80 via-blue-900/60 to-aura-950/90",    accent:"#60a5fa", image:"https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1400&q=80",   badge:"Latest Tech" },
  { slug:"fashion",         label:"Fashion",          tagline:"Dress to Impress",                desc:"Designer pieces from the world's most coveted labels.", gradient:"from-rose-900/80 via-fuchsia-900/60 to-aura-950/90", accent:"#e879f9", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",     badge:"Designer Labels" },
  { slug:"shoes",           label:"Shoes",            tagline:"Every Step in Style",             desc:"From luxury dress shoes to high-performance sneakers.", gradient:"from-orange-900/80 via-amber-900/60 to-aura-950/90",  accent:"#fb923c", image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80",     badge:"Premium Footwear" },
  { slug:"watches",         label:"Watches",          tagline:"Time Is Your Greatest Luxury",    desc:"Swiss movements, sapphire crystals, and timeless design.", gradient:"from-amber-900/80 via-yellow-900/60 to-aura-950/90", accent:"#d4af37", image:"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1400&q=80", badge:"Haute Horlogerie" },
  { slug:"beauty",          label:"Beauty",           tagline:"Your Ritual, Elevated",           desc:"Science-backed skincare and artisan cosmetics.", gradient:"from-pink-900/80 via-rose-900/60 to-aura-950/90",      accent:"#f472b6", image:"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1400&q=80",   badge:"Premium Beauty" },
  { slug:"home-decor",      label:"Home Decor",       tagline:"Live Beautifully",                desc:"Iconic designs that transform every living space.", gradient:"from-teal-900/80 via-emerald-900/60 to-aura-950/90",  accent:"#34d399", image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80",     badge:"Interior Design" },
  { slug:"furniture",       label:"Furniture",        tagline:"Design That Lasts Generations",   desc:"Statement pieces from the world's greatest designers.", gradient:"from-stone-900/80 via-neutral-900/60 to-aura-950/90", accent:"#d6d3d1", image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80",  badge:"Designer Pieces" },
  { slug:"kitchen",         label:"Kitchen",          tagline:"Cook Like a Pro",                 desc:"Professional-grade cookware for the passionate home chef.", gradient:"from-red-900/80 via-orange-900/60 to-aura-950/90",   accent:"#f87171", image:"https://images.unsplash.com/photo-1585515320310-259814833e62?w=1400&q=80", badge:"Chef's Choice" },
  { slug:"gaming",          label:"Gaming",           tagline:"Play at the Highest Level",       desc:"Next-gen consoles, peripherals, and gaming accessories.", gradient:"from-green-900/80 via-emerald-900/60 to-aura-950/90", accent:"#4ade80", image:"https://images.unsplash.com/photo-1607016284318-d1a620960cf1?w=1400&q=80", badge:"Next-Gen Gaming" },
  { slug:"books",           label:"Books",            tagline:"Feed Your Curiosity",             desc:"Curated reading for curious and ambitious minds.", gradient:"from-indigo-900/80 via-blue-900/60 to-aura-950/90",    accent:"#818cf8", image:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1400&q=80",     badge:"Curated Reads" },
  { slug:"sports",          label:"Sports",           tagline:"Perform Without Limits",          desc:"Professional-grade equipment for serious athletes.", gradient:"from-cyan-900/80 via-sky-900/60 to-aura-950/90",       accent:"#22d3ee", image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80", badge:"Pro Equipment" },
  { slug:"fitness",         label:"Fitness",          tagline:"Build Your Best Self",            desc:"Premium fitness equipment for your home gym.", gradient:"from-lime-900/80 via-green-900/60 to-aura-950/90",       accent:"#a3e635", image:"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=1400&q=80",   badge:"Home Gym" },
  { slug:"toys",            label:"Toys",             tagline:"Play Is Serious Business",        desc:"Premium toys that educate, inspire and delight.", gradient:"from-yellow-900/80 via-amber-900/60 to-aura-950/90",   accent:"#facc15", image:"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1400&q=80",   badge:"Premium Play" },
  { slug:"groceries",       label:"Groceries",        tagline:"Gourmet at Your Doorstep",        desc:"Artisanal and gourmet food for the discerning palate.", gradient:"from-green-900/80 via-lime-900/60 to-aura-950/90",   accent:"#86efac", image:"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=1400&q=80",  badge:"Artisan Foods" },
  { slug:"accessories",     label:"Accessories",      tagline:"Details Define Greatness",        desc:"Luxury wallets, scarves, belts and statement pieces.", gradient:"from-emerald-900/80 via-teal-900/60 to-aura-950/90",  accent:"#6ee7b7", image:"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1400&q=80", badge:"Finishing Touch" },
  { slug:"luxury",          label:"Luxury",           tagline:"The Finest Things in Life",       desc:"Ultra-premium pieces for those who accept nothing but the best.", gradient:"from-yellow-900/80 via-amber-900/60 to-aura-950/90", accent:"#d4af37", image:"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1400&q=80", badge:"Ultra Premium" },
  { slug:"seasonal-offers", label:"Seasonal Offers",  tagline:"Limited Time. Unlimited Value.",  desc:"Time-limited deals on premium products. Don't miss out.", gradient:"from-red-900/80 via-rose-900/60 to-aura-950/90",      accent:"#f87171", image:"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80", badge:"Limited Time" },
];

// ── ProductCard with quick preview ───────────────────────────────────────────
function CollectionProductCard({ product, index }: { product: Product; index: number }) {
  const [hovered, setHovered] = useState(false);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const isWishlisted = wishlist?.some((i) => i.product.id === product.id) ?? false;
  const discount = product.comparePrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
    : 0;

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    addToCart.mutate({ productId: product.id });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    toggleWishlist.mutate(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative cursor-pointer"
    >
      <Link to={`/products/${product.slug}`}>
        {/* Image container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4"
          style={{ background: "linear-gradient(135deg, rgba(45,26,94,0.3), rgba(10,6,20,0.5))" }}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-white/10" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-aura-950"
                style={{ background: "linear-gradient(135deg, #d4af37, #fbbf24)" }}>
                FEATURED
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Action buttons */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3 flex gap-2"
              >
                <button onClick={handleCart} disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-aura-950 transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d4af37, #fbbf24)" }}>
                  <ShoppingBag size={13} />
                  {product.stock === 0 ? "Sold Out" : "Add to Cart"}                </button>
                <button onClick={handleWishlist}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all backdrop-blur-sm ${
                    isWishlisted ? "bg-red-500/70 text-white" : "bg-white/20 text-white hover:bg-white/30"
                  }`}>
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                <Link to={`/products/${product.slug}`}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                  onClick={(e) => e.stopPropagation()}>
                  <Eye size={14} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="px-1">
          {product.brand && (
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#a98de0" }}>{product.brand}</p>
          )}
          <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10}
                  className={s <= Math.round(parseFloat(product.rating || "0")) ? "text-amber-400 fill-amber-400" : "text-white/15"} />
              ))}
              <span className="text-[10px] text-white/30 ml-1">({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white">{toINR(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xs text-white/30 line-through">{toINR(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Collections Page ─────────────────────────────────────────────────────
export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<"trending"|"new"|"bestsellers"|"all">("all");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [recentlyViewed, _setRecentlyViewed] = useState<Product[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bannerY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({
    category: activeCategory || undefined,
    search: search || undefined,
    sort: activeTab === "new" ? "createdAt" : activeTab === "trending" ? "rating" : "createdAt",
    order: "desc",
    limit: 24,
  });
  const { data: featuredProds } = useProducts({ featured: true, limit: 4 });

  // Rotate banner every 4s
  useEffect(() => {
    const t = setInterval(() => setActiveBanner(p => (p + 1) % COLLECTION_BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const banner = COLLECTION_BANNERS[activeBanner];
  const filtered = products?.products.filter(p =>
    priceRange[0] === 0 && priceRange[1] === 100000
      ? true
      : parseFloat(p.price) >= priceRange[0] && parseFloat(p.price) <= priceRange[1]
  ) ?? [];

  const tabs = [
    { id: "all", label: "All", icon: <Grid3X3 size={14} /> },
    { id: "trending", label: "Trending", icon: <TrendingUp size={14} /> },
    { id: "new", label: "New Arrivals", icon: <Zap size={14} /> },
    { id: "bestsellers", label: "Best Sellers", icon: <Star size={14} /> },
  ] as const;

  return (
    <div className="min-h-screen">

      {/* ── HERO BANNER ── */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div key={activeBanner} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
            <motion.div style={{ y: bannerY }} className="absolute inset-0">
              <img src={banner.image} alt={banner.label}
                className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <motion.div style={{ opacity: bannerOpacity }}
          className="relative z-10 h-full flex items-center pt-20 px-6 md:px-16">
          <div className="max-w-2xl">
            <motion.span key={`badge-${activeBanner}`} initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
              style={{ color: banner.accent, borderColor: `${banner.accent}40`, background: `${banner.accent}15` }}>
              <Sparkles size={11} /> {banner.badge}
            </motion.span>
            <motion.h1 key={`title-${activeBanner}`} initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-3">
              {banner.label}
            </motion.h1>
            <motion.p key={`tag-${activeBanner}`} initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-light mb-2" style={{ color: banner.accent }}>
              {banner.tagline}
            </motion.p>
            <motion.p key={`desc-${activeBanner}`} initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-white/60 text-sm mb-8 max-w-md">{banner.desc}
            </motion.p>
            <motion.div key={`btn-${activeBanner}`} initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="flex gap-3">
              <button onClick={() => setActiveCategory(banner.slug)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-aura-950 hover:-translate-y-0.5 transition-all"
                style={{ background: `linear-gradient(135deg, ${banner.accent}, ${banner.accent}cc)` }}>
                Shop Now <ArrowRight size={15} />
              </button>
              <Link to={`/shop?category=${banner.slug}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white border border-white/20 hover:bg-white/10 transition-all">
                View All
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Banner dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {COLLECTION_BANNERS.map((_b, i) => (
            <button key={i} onClick={() => setActiveBanner(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === activeBanner ? "24px" : "8px", height: "8px",
                background: i === activeBanner ? banner.accent : "rgba(255,255,255,0.3)"
              }} />
          ))}
        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 right-8 text-white/30">
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ── FEATURED COLLECTIONS STRIP ── */}
      <section className="py-10 px-4 border-y border-white/5"
        style={{ background: "linear-gradient(90deg, rgba(45,26,94,0.3), rgba(10,6,20,0.5), rgba(45,26,94,0.3))" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setActiveCategory("")}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !activeCategory ? "text-aura-950" : "text-white/60 hover:text-white border border-white/10 hover:border-white/20"
              }`}
              style={!activeCategory ? { background: "linear-gradient(135deg, #d4af37, #fbbf24)" } : {}}>
              <Sparkles size={14} /> All Collections
            </button>
            {COLLECTION_BANNERS.map((c) => (
              <button key={c.slug} onClick={() => setActiveCategory(c.slug)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  activeCategory === c.slug
                    ? "text-white border-transparent"
                    : "text-white/60 hover:text-white border-white/10 hover:border-white/20"
                }`}
                style={activeCategory === c.slug
                  ? { background: `linear-gradient(135deg, ${c.accent}40, ${c.accent}20)`, borderColor: `${c.accent}50` }
                  : {}}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI RECOMMENDATION BANNER ── */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6"
            style={{ background: "linear-gradient(135deg, rgba(85,51,168,0.25) 0%, rgba(45,26,94,0.4) 50%, rgba(10,6,20,0.6) 100%)", border: "1px solid rgba(85,51,168,0.3)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20"
                style={{ background: "#7c5cc4" }} />
              <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-[60px] opacity-15"
                style={{ background: "#d4af37" }} />
            </div>
            <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #5533a8, #3d2478)" }}>
              <Sparkles size={28} className="text-white" />
            </div>
            <div className="relative flex-1 text-center md:text-left">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#a98de0" }}>AI Curator</p>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Let AuraBot find your perfect piece
              </h3>
              <p className="text-white/50 text-sm">Describe what you're looking for — our AI will match you with the ideal product from our catalog.</p>
            </div>
            <button onClick={() => (window as any).__aurabot?.()}
              className="relative flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #5533a8, #7c5cc4)", boxShadow: "0 4px 20px rgba(85,51,168,0.4)" }}>
              <Sparkles size={15} /> Ask AuraBot
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS (top 4) ── */}
      {featuredProds && featuredProds.products.length > 0 && !activeCategory && !search && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                  Editor's{" "}
                  <span style={{ background: "linear-gradient(135deg,#d4af37,#fbbf24,#f0e2c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Picks
                  </span>
                </h2>
                <p className="text-white/35 text-sm mt-1">Personally curated by our AI</p>
              </div>
              <Link to="/shop?featured=true" className="flex items-center gap-1.5 text-sm text-aura-300 hover:text-aura-200 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProds.products.slice(0, 4).map((p, i) => (
                <CollectionProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MAIN PRODUCTS SECTION ── */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? "text-aura-950" : "text-white/50 hover:text-white"
                  }`}
                  style={activeTab === tab.id ? { background: "linear-gradient(135deg,#d4af37,#fbbf24)" } : {}}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" placeholder="Search products..." value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                aria-label="Search products" />
              {searchInput && (
                <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-all ${
                filtersOpen ? "text-aura-200" : "text-white/60 hover:text-white"
              }`}
              style={{
                background: filtersOpen ? "rgba(85,51,168,0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${filtersOpen ? "rgba(85,51,168,0.4)" : "rgba(255,255,255,0.1)"}`,
              }}>
              <SlidersHorizontal size={14} /> Filters
            </button>

            {/* Results count */}
            {filtered.length > 0 && (
              <span className="text-xs text-white/30 ml-auto">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                <div className="rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                      Price Range: ₹{(priceRange[0] * 83).toLocaleString("en-IN")} — ₹{priceRange[1] === 100000 ? "83,00,000+" : (priceRange[1] * 83).toLocaleString("en-IN")}
                    </label>
                    <div className="flex gap-3">
                      <input type="range" min={0} max={100000} step={100}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        className="flex-1 accent-aura-400" aria-label="Min price" />
                      <input type="range" min={0} max={100000} step={100}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        className="flex-1 accent-aura-400" aria-label="Max price" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Category</label>
                    <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      aria-label="Filter by category">
                      <option value="" className="bg-aura-900">All Categories</option>
                      {categories?.map(c => (
                        <option key={c.id} value={c.slug} className="bg-aura-900">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setActiveCategory(""); setPriceRange([0, 100000]); setSearchInput(""); }}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                      <X size={13} /> Clear all
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-[3/4] shimmer rounded-2xl mb-3" />
                  <div className="h-3 shimmer rounded w-1/2 mb-2" />
                  <div className="h-4 shimmer rounded w-3/4 mb-2" />
                  <div className="h-5 shimmer rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: "rgba(85,51,168,0.15)", border: "1px solid rgba(85,51,168,0.2)" }}>
                <Search size={32} className="text-aura-400" />
              </div>
              <p className="text-white/40 text-lg mb-2">No products found</p>
              <p className="text-white/25 text-sm mb-6">Try adjusting your filters or search term</p>
              <button onClick={() => { setActiveCategory(""); setSearchInput(""); setPriceRange([0, 100000]); }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: "rgba(85,51,168,0.3)", border: "1px solid rgba(85,51,168,0.4)" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((product, i) => (
                <CollectionProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── RECENTLY VIEWED (persisted in state) ── */}
      {recentlyViewed.length > 0 && (
        <section className="py-12 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={16} className="text-white/40" />
              <h3 className="font-semibold text-white/70 text-sm">Recently Viewed</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {recentlyViewed.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="flex-shrink-0 w-36 group">
                  <div className="aspect-square rounded-xl overflow-hidden mb-2"
                    style={{ background: "rgba(45,26,94,0.3)" }}>
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  <p className="text-xs text-white/60 truncate group-hover:text-white transition-colors">{p.name}</p>
                  <p className="text-xs font-semibold text-white">{toINR(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
