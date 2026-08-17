import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#f9f4ef";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddToCart();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: CREAM }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BLUSH }}>
            Your Saved Items
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: DARK }}>
            My Wishlist
          </h1>
          <p className="text-sm mt-2" style={{ color: "rgba(44,35,32,0.45)" }}>
            {wishlist?.length
              ? `${wishlist.length} saved item${wishlist.length > 1 ? "s" : ""}`
              : "Your saved items will appear here"}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white">
                <div className="aspect-[3/4] shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-3 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(196,122,128,0.1)" }}>
              <Heart size={36} style={{ color: "rgba(196,122,128,0.4)" }} />
            </div>
            <p className="text-xl font-display font-semibold mb-2" style={{ color: "rgba(44,35,32,0.4)" }}>
              Nothing saved yet
            </p>
            <p className="text-sm mb-8" style={{ color: "rgba(44,35,32,0.3)" }}>
              Browse our collections and save your favourites
            </p>
            <Link to="/shop" className="btn-primary">Browse Collections</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
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
                <Link
                  to={`/products/${item.product.slug}`}
                  className="block relative aspect-[3/4]"
                  style={{ background: "#f0e8e0" }}
                >
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={32} style={{ color: "rgba(44,35,32,0.12)" }} />
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  {item.product.brand && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                      style={{ color: BLUSH }}>
                      {item.product.brand}
                    </p>
                  )}
                  <Link to={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-medium mb-2 line-clamp-2 transition-colors hover:text-black"
                      style={{ color: DARK }}>
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-base font-display font-semibold mb-3" style={{ color: DARK }}>
                    {toINR(item.product.price)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart.mutate({ productId: item.product.id })}
                      disabled={addToCart.isPending || item.product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                      style={{ background: DARK }}
                    >
                      <ShoppingBag size={14} />
                      Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist.mutate(item.product.id)}
                      disabled={toggleWishlist.isPending}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{
                        background: "rgba(196,122,128,0.08)",
                        color: BLUSH,
                        border: "1px solid rgba(196,122,128,0.2)",
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
