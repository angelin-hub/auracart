import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";

interface Props { product: Product; index?: number; }

export default function ProductCard({ product, index = 0 }: Props) {
  const addToCart    = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const isWishlisted = wishlist?.some(i => i.product.id === product.id) ?? false;
  const discount = product.comparePrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    addToCart.mutate({ productId: product.id });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    toggleWishlist.mutate(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
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
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,122,128,0.35)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(44,35,32,0.05)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,35,32,0.08)";
        }}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "#f0e8e0" }}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ShoppingBag size={36} style={{ color: "rgba(44,35,32,0.15)" }} />
              <span className="text-xs" style={{ color: "rgba(44,35,32,0.25)" }}>No image</span>
            </div>
          )}

          {/* Action overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "rgba(44,35,32,0.12)", backdropFilter: "blur(2px)" }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={addToCart.isPending || product.stock === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all disabled:opacity-50"
              style={{ background: "white", color: DARK }}
              aria-label="Add to cart"
            >
              <ShoppingBag size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
              style={{
                background: isWishlisted ? BLUSH : "white",
                color: isWishlisted ? "white" : DARK,
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
            </motion.button>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to={`/products/${product.slug}`}
                onClick={e => e.stopPropagation()}
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                style={{ background: "white", color: DARK }}
                aria-label="View product"
              >
                <Eye size={15} />
              </Link>
            </motion.div>
          </div>

          {/* Wishlist heart — top right always visible */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{
              background: isWishlisted ? BLUSH : "rgba(255,255,255,0.9)",
              color: isWishlisted ? "white" : DARK,
              boxShadow: "0 2px 8px rgba(44,35,32,0.12)",
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save"}
          >
            <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} />
          </motion.button>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
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
            {product.stock === 0 && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(44,35,32,0.1)", color: DARK }}>
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: BLUSH }}>
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-medium line-clamp-2 leading-snug mb-2 transition-colors"
            style={{ color: DARK, fontFamily: "'Jost', system-ui, sans-serif" }}>
            {product.name}
          </h3>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s} size={10}
                  style={{
                    color: s <= Math.round(parseFloat(product.rating || "0")) ? BLUSH : "rgba(44,35,32,0.15)",
                    fill:  s <= Math.round(parseFloat(product.rating || "0")) ? BLUSH : "rgba(44,35,32,0.15)",
                  }}
                />
              ))}
              <span className="text-[10px]" style={{ color: "rgba(44,35,32,0.35)" }}>
                ({product.reviewCount})
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold" style={{ color: DARK }}>{toINR(product.price)}</span>
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
