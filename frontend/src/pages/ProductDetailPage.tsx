import { motion } from "framer-motion";
import {
  ShoppingBag, Heart, Star, Truck, Shield, RefreshCw,
  ArrowLeft, Package, ChevronLeft, ChevronRight
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { toINR } from "@/lib/currency";
import { useState } from "react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useProduct(slug!);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const product = data?.product;
  const isWishlisted = wishlist?.some((i) => i.product.id === product?.id) ?? false;
  const discount = product?.comparePrice
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
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square shimmer rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-5 shimmer rounded w-1/3" />
            <div className="h-8 shimmer rounded" />
            <div className="h-8 shimmer rounded w-2/3" />
            <div className="h-24 shimmer rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-center">
        <div>
          <Package size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-xl">Product not found</p>
          <Link to="/shop" className="mt-4 inline-block text-aura-300 hover:underline">← Back to shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [""];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-white/30 mb-8"
        >
          <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-48">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-square rounded-3xl overflow-hidden glass-card mb-4 group">
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-aura-800 to-aura-900">
                  <ShoppingBag size={60} className="text-white/10" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-red-500/80 text-white px-2.5 py-1 text-sm font-semibold">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImg === i ? "border-aura-400" : "border-transparent opacity-50 hover:opacity-75"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5 pt-2"
          >
            {product.brand && (
              <span className="text-sm font-semibold text-aura-300 uppercase tracking-widest">
                {product.brand}
              </span>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(parseFloat(product.rating || "0"))
                        ? "text-gold-400 fill-gold-400"
                        : "text-white/15"}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/50">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">
                {toINR(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-white/30 line-through">
                  {toINR(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="badge bg-red-500/20 text-red-400 border border-red-500/20">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-sm text-white/50">
                {product.stock > 0
                  ? product.stock > 10 ? "In stock" : `Only ${product.stock} left`
                  : "Out of stock"}
              </span>
            </div>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-white/60 leading-relaxed text-sm">{product.shortDescription}</p>
            )}

            {/* Quantity + Actions */}
            <div className="space-y-3 pt-2">
              {/* Qty */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50">Quantity</span>
                <div className="flex items-center gap-2 glass-card rounded-xl px-1 py-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium text-white">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || product.stock === 0}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${
                    isWishlisted
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "glass-card border-white/10 text-white/50 hover:text-red-400"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </motion.button>
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
              {[
                { icon: <Truck size={16} />, label: "Free shipping over $100" },
                { icon: <Shield size={16} />, label: "Authenticity guaranteed" },
                { icon: <RefreshCw size={16} />, label: "30-day returns" },
              ].map((perk) => (
                <div key={perk.label} className="flex flex-col items-center text-center gap-1.5 p-2">
                  <div className="text-aura-300">{perk.icon}</div>
                  <span className="text-[11px] text-white/40 leading-tight">{perk.label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge-aura text-xs">{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 glass-card rounded-3xl p-8"
          >
            <h2 className="font-display text-2xl font-bold text-white mb-4">Product Details</h2>
            <p className="text-white/60 leading-relaxed whitespace-pre-line">{product.description}</p>

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="bg-white/3 rounded-xl p-3">
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1">{key}</p>
                    <p className="text-sm text-white/80 font-medium">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
