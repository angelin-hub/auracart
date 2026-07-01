import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { toINR } from "@/lib/currency";

const N = "#222E50";
const G = "#FCCB06";

interface Props { product: Product; index?: number; }

export default function ProductCard({ product, index = 0 }: Props) {
  const addToCart = useAddToCart();
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
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}>
      <Link to={`/products/${product.slug}`}
        className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{ background: "white", border: "1px solid rgba(34,46,80,0.08)", boxShadow: "0 2px 12px rgba(34,46,80,0.06)" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(34,46,80,0.12)";
          (e.currentTarget as HTMLElement).style.borderColor = G;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(34,46,80,0.06)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,46,80,0.08)";
        }}>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: "#f5f5f5" }}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={36} style={{ color: "rgba(34,46,80,0.15)" }} />
            </div>
          )}

          {/* Action overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "rgba(34,46,80,0.15)", backdropFilter: "blur(2px)" }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart} disabled={addToCart.isPending || product.stock === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all disabled:opacity-50"
              style={{ background: G, color: N }} aria-label="Add to cart">
              <ShoppingBag size={15} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
              style={{ background: isWishlisted ? "#ef4444" : "white", color: isWishlisted ? "white" : N }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
              <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
            </motion.button>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link to={`/products/${product.slug}`} onClick={e => e.stopPropagation()}
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                style={{ background: "white", color: N }} aria-label="View product">
                <Eye size={15} />
              </Link>
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: G, color: N }}>FEATURED</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,46,80,0.15)", color: N }}>SOLD OUT</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {product.brand && (
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#d4a500" }}>
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-2 transition-colors"
            style={{ color: N }}>
            {product.name}
          </h3>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10}
                  style={{
                    color: s <= Math.round(parseFloat(product.rating || "0")) ? G : "rgba(34,46,80,0.15)",
                    fill: s <= Math.round(parseFloat(product.rating || "0")) ? G : "rgba(34,46,80,0.15)",
                  }} />
              ))}
              <span className="text-[10px]" style={{ color: "rgba(34,46,80,0.35)" }}>({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold" style={{ color: N }}>{toINR(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xs line-through" style={{ color: "rgba(34,46,80,0.3)" }}>{toINR(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
