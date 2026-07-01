import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import { toINR } from "@/lib/currency";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddToCart();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            My <span className="text-gold-gradient">Wishlist</span>
          </h1>
          <p className="text-white/40 text-sm">
            {wishlist?.length
              ? `${wishlist.length} saved item${wishlist.length > 1 ? "s" : ""}`
              : "Your saved items will appear here"}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-3 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={56} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-xl mb-2">No saved items yet</p>
            <p className="text-white/25 text-sm mb-8">
              Browse our collection and save your favourites
            </p>
            <Link to="/shop" className="btn-primary">Browse Shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover rounded-2xl overflow-hidden group"
              >
                <Link to={`/products/${item.product.slug}`} className="block relative aspect-square bg-white/3">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={32} className="text-white/15" />
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  {item.product.brand && (
                    <p className="text-[11px] font-semibold text-aura-300 uppercase tracking-wider mb-1">
                      {item.product.brand}
                    </p>
                  )}
                  <Link to={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-semibold text-white/90 hover:text-white mb-2 line-clamp-2 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-base font-bold text-white mb-3">
                    {toINR(item.product.price)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart.mutate({ productId: item.product.id })}
                      disabled={addToCart.isPending || item.product.stock === 0}
                      className="btn-gold flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist.mutate(item.product.id)}
                      disabled={toggleWishlist.isPending}
                      className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
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
