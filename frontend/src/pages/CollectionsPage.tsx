import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, SlidersHorizontal, Heart, ShoppingBag, Star, Sparkles,
  ArrowRight, X, Eye, TrendingUp, Grid3X3, ChevronDown, Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import type { Product } from "@/types";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#f9f4ef";

// ── Fashion collection banners ────────────────────────────────────────────────
const COLLECTION_BANNERS = [
  { slug: "new-arrivals",  label: "New Arrivals",  tagline: "Just Dropped This Week",       desc: "Fresh styles landing in our boutique every single week.", accent: BLUSH,    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4ef5?w=1400&q=80",  badge: "Just In" },
  { slug: "dresses",       label: "Dresses",        tagline: "Effortless Elegance",           desc: "From breezy sundresses to show-stopping evening gowns.", accent: "#d4909a", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1400&q=80",  badge: "Best Seller" },
  { slug: "kurtis",        label: "Kurtis",          tagline: "Contemporary Comfort",          desc: "Modern kurtis that blend tradition with today's trends.", accent: "#b88400", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=80",  badge: "Trending" },
  { slug: "ethnic-wear",   label: "Ethnic Wear",    tagline: "Heritage Reimagined",           desc: "Celebrate culture with our curated ethnic collection.", accent: "#9a6800", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1400&q=80",  badge: "New Collection" },
  { slug: "sarees",        label: "Sarees",          tagline: "Six Yards of Grace",            desc: "Timeless sarees for every occasion and every woman.", accent: "#c47a80",  image: "https://images.unsplash.com/photo-1617627143233-c0db46d1c4db?w=1400&q=80",  badge: "Classic" },
  { slug: "co-ord-sets",   label: "Co-ord Sets",    tagline: "Perfectly Matched",             desc: "Curated co-ord sets so you're always effortlessly styled.", accent: "#7a5548", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&q=80", badge: "New In" },
  { slug: "western-wear",  label: "Western Wear",   tagline: "Modern & Minimal",              desc: "Clean lines and contemporary silhouettes for every day.", accent: "#5c3d32", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1400&q=80",  badge: "Trending" },
  { slug: "tops",          label: "Tops",            tagline: "Style on Top",                  desc: "From casual tees to chic blouses — versatile tops for all.", accent: "#b88400", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=80", badge: "Everyday Fav" },
  { slug: "party-wear",    label: "Party Wear",     tagline: "Shine Every Night",             desc: "Statement pieces for parties, events and celebrations.", accent: BLUSH,    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1400&q=80",  badge: "Hot Pick" },
  { slug: "casual-wear",   label: "Casual Wear",    tagline: "Easy, Breezy, Beautiful",       desc: "Relaxed fits that keep you comfortable and stylish.", accent: "#9a8070",  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80",  badge: "Everyday" },
  { slug: "sale",          label: "Sale",            tagline: "Up to 60% Off",                 desc: "Premium fashion at unbeatable prices. Limited time only.", accent: "#ef4444", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=80",   badge: "Last Chance" },
  { slug: "best-sellers",  label: "Best Sellers",   tagline: "Loved by Thousands",            desc: "Our most-loved pieces with hundreds of five-star reviews.", accent: "#d4a020", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80", badge: "★ Top Rated" },
];

// ── CollectionProductCard ─────────────────────────────────────────────────────
function CollectionProductCard({ product, index }: { product: Product; index: number }) {
  const [hovered, setHovered] = useState(false);
  const addToCart      = useAddToCart();
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative cursor-pointer"
    >
      <Link to={`/products/${product.slug}`}>
        {/* Image */}
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3"
          style={{ background: "#f0e8e0" }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} style={{ color: "rgba(44,35,32,0.12)" }} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ background: BLUSH }}>
                FEATURED
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500 text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Action buttons on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-3 left-3 right-3 flex gap-2"
              >
                <button
                  onClick={handleCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2c2320, #402a22)" }}
                >
                  <ShoppingBag size={13} />
                  {product.stock === 0 ? "Sold Out" : "Add to Bag"}
                </button>
                <button
                  onClick={handleWishlist}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all backdrop-blur-sm ${
                    isWishlisted ? "text-white" : "bg-white/25 text-white hover:bg-white/40"
                  }`}
                  style={isWishlisted ? { background: BLUSH } : {}}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                <Link
                  to={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/25 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
                  aria-label="View product"
                >
                  <Eye size={14} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="px-0.5">
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: BLUSH }}>
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-medium line-clamp-1 mb-1.5 group-hover:text-black transition-colors"
            style={{ color: DARK }}>
            {product.name}
          </h3>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10}
                  style={{
                    color: s <= Math.round(parseFloat(product.rating || "0")) ? BLUSH : "rgba(44,35,32,0.15)",
                    fill:  s <= Math.round(parseFloat(product.rating || "0")) ? BLUSH : "rgba(44,35,32,0.15)",
                  }} />
              ))}
              <span className="text-[10px]" style={{ color: "rgba(44,35,32,0.35)" }}>({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold" style={{ color: DARK }}>{toINR(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xs line-through" style={{ color: "rgba(44,35,32,0.3)" }}>
                {toINR(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Collections Page ─────────────────────────────────────────────────────
export default function CollectionsPage() {
  const [activeTab, setActiveTab]         = useState<"trending"|"new"|"bestsellers"|"all">("all");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch]               = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [filtersOpen, setFiltersOpen]     = useState(false);
  const [priceRange, setPriceRange]       = useState<[number, number]>([0, 100000]);
  const [activeBanner, setActiveBanner]   = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bannerY       = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
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
      : parseFloat(p.price) >= priceRange[0] / 83 && parseFloat(p.price) <= priceRange[1] / 83
  ) ?? [];

  const tabs = [
    { id: "all",        label: "All",          icon: <Grid3X3 size={14} /> },
    { id: "trending",   label: "Trending",     icon: <TrendingUp size={14} /> },
    { id: "new",        label: "New Arrivals", icon: <Zap size={14} /> },
    { id: "bestsellers",label: "Best Sellers", icon: <Star size={14} /> },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>

      {/* ── HERO BANNER ── */}
      <section ref={heroRef} className="relative h-[65vh] min-h-[480px] overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeBanner}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <motion.div style={{ y: bannerY }} className="absolute inset-0">
              <img src={banner.image} alt={banner.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to right, rgba(44,35,32,0.85) 0%, rgba(44,35,32,0.5) 50%, rgba(44,35,32,0.2) 100%)" }} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <motion.div
          style={{ opacity: bannerOpacity }}
          className="relative z-10 h-full flex items-center pt-20 px-6 md:px-16"
        >
          <div className="max-w-xl">
            <motion.span
              key={`badge-${activeBanner}`}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
              style={{ color: banner.accent, borderColor: `${banner.accent}50`, background: `${banner.accent}18` }}
            >
              <Sparkles size={11} /> {banner.badge}
            </motion.span>
            <motion.h1
              key={`title-${activeBanner}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight mb-2"
            >
              {banner.label}
            </motion.h1>
            <motion.p
              key={`tag-${activeBanner}`}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-light italic mb-2"
              style={{ color: banner.accent }}
            >
              {banner.tagline}
            </motion.p>
            <motion.p
              key={`desc-${activeBanner}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/60 mb-8 max-w-sm"
            >
              {banner.desc}
            </motion.p>
            <motion.div
              key={`btn-${activeBanner}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex gap-3"
            >
              <button
                onClick={() => setActiveCategory(banner.slug)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white hover:-translate-y-0.5 transition-all"
                style={{ background: banner.accent, boxShadow: `0 4px 16px ${banner.accent}50` }}
              >
                Shop Now <ArrowRight size={14} />
              </button>
              <Link
                to={`/shop?category=${banner.slug}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white border border-white/25 hover:bg-white/10 transition-all"
              >
                View All
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {COLLECTION_BANNERS.map((_b, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === activeBanner ? "24px" : "8px",
                height: "8px",
                background: i === activeBanner ? banner.accent : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>

        <motion.div
          animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-5 right-8"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ── CATEGORY FILTER STRIP ── */}
      <section className="py-6 px-4"
        style={{ background: "white", borderBottom: "1px solid rgba(44,35,32,0.08)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory("")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={!activeCategory
                ? { background: DARK, color: "white" }
                : { background: "transparent", color: "rgba(44,35,32,0.6)", border: "1px solid rgba(44,35,32,0.12)" }}
            >
              <Sparkles size={13} /> All Collections
            </button>
            {COLLECTION_BANNERS.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveCategory(c.slug)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                style={activeCategory === c.slug
                  ? { background: `${c.accent}15`, color: c.accent, borderColor: `${c.accent}40` }
                  : { background: "transparent", color: "rgba(44,35,32,0.6)", borderColor: "rgba(44,35,32,0.1)" }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLE ASSISTANT BANNER ── */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
            style={{
              background: "linear-gradient(135deg, #fdf0ec 0%, #f9f4ef 50%, #fdf4ec 100%)",
              border: "1px solid rgba(196,122,128,0.2)",
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-25"
              style={{ background: BLUSH }} />
            <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="relative flex-1 text-center md:text-left">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: BLUSH }}>
                Style Assistant
              </p>
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-2" style={{ color: DARK }}>
                Let our AI find your perfect look
              </h3>
              <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
                Describe the occasion, your style preference, or a piece you loved — we'll match you with something beautiful.
              </p>
            </div>
            <button
              onClick={() => (window as any).__aurabot?.()}
              className="relative flex-shrink-0 btn-blush flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
              style={{
                background: "linear-gradient(135deg, #c47a80, #d4909a)",
                color: "white",
                boxShadow: "0 4px 16px rgba(196,122,128,0.3)",
              }}
            >
              <Sparkles size={14} /> Ask Style Assistant
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── EDITOR'S PICKS ── */}
      {featuredProds && featuredProds.products.length > 0 && !activeCategory && !search && (
        <section className="py-6 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: DARK }}>
                  Editor's <em style={{ color: BLUSH }}>Picks</em>
                </h2>
                <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.45)" }}>Hand-selected by our stylists</p>
              </div>
              <Link
                to="/shop?featured=true"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: "rgba(44,35,32,0.5)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = BLUSH}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.5)"}
              >
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
          <div className="flex flex-wrap items-center gap-3 mb-7">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
              style={{ background: "white", border: "1px solid rgba(44,35,32,0.1)" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={activeTab === tab.id
                    ? { background: DARK, color: "white" }
                    : { color: "rgba(44,35,32,0.5)" }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(44,35,32,0.35)" }} />
              <input
                type="text"
                placeholder="Search dresses, kurtis, sarees..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "white",
                  border: "1px solid rgba(44,35,32,0.12)",
                  color: DARK,
                }}
                aria-label="Search products"
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = BLUSH}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,35,32,0.12)"}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(44,35,32,0.35)" }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-all"
              style={{
                background: filtersOpen ? "rgba(196,122,128,0.1)" : "white",
                border: `1px solid ${filtersOpen ? "rgba(196,122,128,0.4)" : "rgba(44,35,32,0.12)"}`,
                color: filtersOpen ? BLUSH : "rgba(44,35,32,0.6)",
              }}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            {filtered.length > 0 && (
              <span className="text-xs ml-auto" style={{ color: "rgba(44,35,32,0.4)" }}>
                {filtered.length} style{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6"
              >
                <div className="rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-5"
                  style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                      style={{ color: "rgba(44,35,32,0.4)" }}>
                      Price Range: ₹{priceRange[0].toLocaleString("en-IN")} — ₹{priceRange[1] === 100000 ? "1,00,000+" : priceRange[1].toLocaleString("en-IN")}
                    </label>
                    <div className="flex gap-3">
                      <input type="range" min={0} max={100000} step={500}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        className="flex-1" style={{ accentColor: BLUSH }} aria-label="Min price" />
                      <input type="range" min={0} max={100000} step={500}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        className="flex-1" style={{ accentColor: BLUSH }} aria-label="Max price" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                      style={{ color: "rgba(44,35,32,0.4)" }}>
                      Category
                    </label>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "#f9f4ef",
                        border: "1px solid rgba(44,35,32,0.12)",
                        color: DARK,
                      }}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      {categories?.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => { setActiveCategory(""); setPriceRange([0, 100000]); setSearchInput(""); }}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: BLUSH }}
                    >
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
                <div key={i}>
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
                style={{ background: "rgba(196,122,128,0.1)" }}>
                <Search size={32} style={{ color: BLUSH }} />
              </div>
              <p className="text-lg mb-2 font-medium" style={{ color: "rgba(44,35,32,0.5)" }}>
                No styles found
              </p>
              <p className="text-sm mb-6" style={{ color: "rgba(44,35,32,0.35)" }}>
                Try adjusting your filters or search term
              </p>
              <button
                onClick={() => { setActiveCategory(""); setSearchInput(""); setPriceRange([0, 100000]); }}
                className="btn-primary px-6 py-2.5 text-sm"
              >
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
    </div>
  );
}
