import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Heart, Star, Truck, Shield, RefreshCw,
  Package, ChevronLeft, ChevronRight, ArrowLeft, Minus, Plus, Info
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#f9f4ef";

const SIZES   = ["XS","S","M","L","XL","XXL"];
const COLORS  = [
  { name: "Ivory",  hex: "#f5ede3" },
  { name: "Blush",  hex: "#ebbfc5" },
  { name: "Mocha",  hex: "#7a5548" },
  { name: "Black",  hex: "#1a1714" },
  { name: "Rose",   hex: "#c47a80" },
  { name: "Sand",   hex: "#d4b896" },
];

export default function ProductDetailPage() {
  const { slug }       = useParams<{ slug: string }>();
  const { data, isLoading } = useProduct(slug!);
  const addToCart      = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [qty,       setQty]       = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selSize,   setSelSize]   = useState<string | null>(null);
  const [selColor,  setSelColor]  = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details"|"fabric"|"care"|"shipping">("details");

  const product    = data?.product;
  const isWishlisted = wishlist?.some((i) => i.product.id === product?.id) ?? false;
  const discount   = product?.comparePrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    addToCart.mutate({ productId: product!.id, quantity: qty });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    toggleWishlist.mutate(product!.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] shimmer rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-5 shimmer rounded w-1/3" />
            <div className="h-8 shimmer rounded" />
            <div className="h-6 shimmer rounded w-1/2" />
            <div className="h-24 shimmer rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-center" style={{ background: CREAM }}>
        <div>
          <Package size={48} style={{ color: "rgba(44,35,32,0.2)" }} className="mx-auto mb-4" />
          <p className="text-xl mb-4 font-display" style={{ color: "rgba(44,35,32,0.5)" }}>Product not found</p>
          <Link to="/shop" className="btn-primary">← Back to shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [""];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: CREAM }}>
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs mb-8"
          style={{ color: "rgba(44,35,32,0.4)" }}
        >
          <Link to="/" className="hover:underline transition-colors" style={{ color: "rgba(44,35,32,0.5)" }}>Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:underline transition-colors" style={{ color: "rgba(44,35,32,0.5)" }}>Shop</Link>
          <span>/</span>
          <span style={{ color: DARK }} className="truncate max-w-48">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Images ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 group"
              style={{ background: "#f0e8e0" }}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-103"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <ShoppingBag size={60} style={{ color: "rgba(44,35,32,0.1)" }} />
                  <span className="text-sm" style={{ color: "rgba(44,35,32,0.3)" }}>No image available</span>
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-boutique"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} style={{ color: DARK }} />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-boutique"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} style={{ color: DARK }} />
                  </button>
                </>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-red-500 text-white px-2.5 py-1 text-sm font-semibold rounded-full">
                    -{discount}%
                  </span>
                </div>
              )}

              {/* Wishlist FAB */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-boutique transition-all"
                style={{
                  background: isWishlisted ? BLUSH : "rgba(255,255,255,0.9)",
                  color: isWishlisted ? "white" : DARK,
                }}
                aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all"
                    style={{
                      borderColor: activeImg === i ? BLUSH : "transparent",
                      opacity: activeImg === i ? 1 : 0.55,
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: "#f0e8e0" }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Product Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5 pt-2"
          >
            {product.brand && (
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BLUSH }}>
                {product.brand}
              </p>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight" style={{ color: DARK }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14}
                      style={{
                        color: s <= Math.round(parseFloat(product.rating || "0")) ? BLUSH : "rgba(44,35,32,0.15)",
                        fill:  s <= Math.round(parseFloat(product.rating || "0")) ? BLUSH : "rgba(44,35,32,0.15)",
                      }} />
                  ))}
                </div>
                <span className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display font-semibold" style={{ color: DARK }}>
                {toINR(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl line-through" style={{ color: "rgba(44,35,32,0.3)" }}>
                  {toINR(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: "#ef4444" }}>
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full`}
                style={{ background: product.stock > 0 ? "#22c55e" : "#ef4444" }} />
              <span className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
                {product.stock > 0
                  ? product.stock > 10 ? "In stock" : `Only ${product.stock} left`
                  : "Out of stock"}
              </span>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm leading-relaxed" style={{ color: "rgba(44,35,32,0.6)" }}>
                {product.shortDescription}
              </p>
            )}

            {/* ── Color selector ── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: "rgba(44,35,32,0.5)" }}>
                Colour {selColor && <span style={{ color: DARK }}>— {selColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelColor(c.name === selColor ? null : c.name)}
                    title={c.name}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      background: c.hex,
                      borderColor: selColor === c.name ? BLUSH : "rgba(44,35,32,0.15)",
                      boxShadow: selColor === c.name ? `0 0 0 2px white, 0 0 0 4px ${BLUSH}` : "none",
                      transform: selColor === c.name ? "scale(1.1)" : "scale(1)",
                    }}
                    aria-label={`Select colour ${c.name}`}
                    aria-pressed={selColor === c.name}
                  />
                ))}
              </div>
            </div>

            {/* ── Size selector ── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(44,35,32,0.5)" }}>
                  Size {selSize && <span style={{ color: DARK }}>— {selSize}</span>}
                </p>
                <button className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: BLUSH }}>
                  <Info size={12} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelSize(size === selSize ? null : size)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                    style={{
                      background: selSize === size ? DARK : "white",
                      color: selSize === size ? "white" : DARK,
                      borderColor: selSize === size ? DARK : "rgba(44,35,32,0.15)",
                    }}
                    aria-pressed={selSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Quantity + CTA ── */}
            <div className="space-y-3 pt-2">
              {/* Qty */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(44,35,32,0.5)" }}>Qty</span>
                <div className="flex items-center gap-2 rounded-xl px-2 py-1"
                  style={{ background: "white", border: "1.5px solid rgba(44,35,32,0.12)" }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: DARK }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f0e8e0"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold" style={{ color: DARK }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ color: DARK }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f0e8e0"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || product.stock === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={17} />
                  {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2"
                  style={{
                    background: isWishlisted ? "rgba(196,122,128,0.1)" : "white",
                    borderColor: isWishlisted ? BLUSH : "rgba(44,35,32,0.15)",
                    color: isWishlisted ? BLUSH : "rgba(44,35,32,0.5)",
                  }}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
                </motion.button>
              </div>

              {/* Buy now */}
              <Link
                to="/checkout"
                onClick={() => addToCart.mutate({ productId: product.id, quantity: qty })}
                className="btn-blush w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #c47a80, #d4909a)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(196,122,128,0.3)",
                }}
              >
                Buy Now
              </Link>
            </div>

            {/* ── Perks ── */}
            <div className="grid grid-cols-3 gap-3 pt-3"
              style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}>
              {[
                { icon: <Truck size={16} />,     label: "Free shipping over ₹999" },
                { icon: <Shield size={16} />,    label: "100% authentic fabric" },
                { icon: <RefreshCw size={16} />, label: "Easy 30-day returns" },
              ].map((perk) => (
                <div key={perk.label} className="flex flex-col items-center text-center gap-1.5 p-2">
                  <div style={{ color: BLUSH }}>{perk.icon}</div>
                  <span className="text-[10px] leading-tight" style={{ color: "rgba(44,35,32,0.45)" }}>
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(196,122,128,0.08)",
                      color: BLUSH,
                      border: "1px solid rgba(196,122,128,0.2)",
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Tabbed Details ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 rounded-3xl overflow-hidden"
          style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}
        >
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: "rgba(44,35,32,0.08)" }}>
            {(["details","fabric","care","shipping"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-4 text-sm font-medium transition-all capitalize"
                style={{
                  color: activeTab === tab ? DARK : "rgba(44,35,32,0.45)",
                  borderBottom: `2px solid ${activeTab === tab ? BLUSH : "transparent"}`,
                  background: activeTab === tab ? "rgba(196,122,128,0.04)" : "transparent",
                }}
              >
                {tab === "details" ? "Product Details" : tab === "fabric" ? "Fabric & Material" : tab === "care" ? "Care Instructions" : "Shipping"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === "details" && (
              <div>
                {product.description ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgba(44,35,32,0.65)" }}>
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: "rgba(44,35,32,0.4)" }}>No description available.</p>
                )}
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(product.attributes).map(([key, val]) => (
                      <div key={key} className="rounded-xl p-3"
                        style={{ background: "#f9f4ef", border: "1px solid rgba(44,35,32,0.07)" }}>
                        <p className="text-[10px] uppercase tracking-wider mb-1"
                          style={{ color: "rgba(44,35,32,0.4)" }}>{key}</p>
                        <p className="text-sm font-medium" style={{ color: DARK }}>{val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "fabric" && (
              <div className="space-y-4 text-sm" style={{ color: "rgba(44,35,32,0.65)" }}>
                <p>Our garments are crafted from premium fabrics sourced responsibly from trusted weavers across India. We use only the finest materials to ensure comfort, longevity and a beautiful drape.</p>
                <ul className="space-y-2 mt-4">
                  {["Premium quality fabric", "Breathable and skin-friendly", "Colourfast dyes — won't bleed or fade", "Sustainably sourced materials"].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span style={{ color: BLUSH }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "care" && (
              <div className="space-y-4 text-sm" style={{ color: "rgba(44,35,32,0.65)" }}>
                <p>To keep your garment looking its best, please follow these care instructions carefully:</p>
                <ul className="space-y-2 mt-4">
                  {[
                    "Hand wash or gentle machine wash in cold water",
                    "Use mild detergent — avoid bleach",
                    "Do not tumble dry; dry in shade",
                    "Iron on low to medium heat",
                    "Store in a cool, dry place",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span style={{ color: BLUSH }}>✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-4 text-sm" style={{ color: "rgba(44,35,32,0.65)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Standard Delivery", desc: "5–7 business days · Free over ₹999", icon: <Truck size={20} /> },
                    { title: "Express Delivery",  desc: "2–3 business days · ₹149",          icon: <Truck size={20} /> },
                    { title: "Easy Returns",      desc: "30-day hassle-free returns",          icon: <RefreshCw size={20} /> },
                    { title: "100% Authentic",    desc: "Every piece quality-verified",        icon: <Shield size={20} /> },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ background: "#f9f4ef", border: "1px solid rgba(44,35,32,0.07)" }}>
                      <div style={{ color: BLUSH, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <p className="font-semibold text-sm mb-0.5" style={{ color: DARK }}>{item.title}</p>
                        <p className="text-xs" style={{ color: "rgba(44,35,32,0.5)" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "rgba(44,35,32,0.45)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = DARK}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.45)"}
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
