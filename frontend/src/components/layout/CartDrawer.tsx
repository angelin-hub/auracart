import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/useCart";
import { useAuthStore } from "@/store/authStore";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";

export default function CartDrawer() {
  const { isOpen, setOpen } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(44,35,32,0.25)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{
              background: "#fdf8f3",
              borderLeft: "1px solid rgba(44,35,32,0.1)",
              boxShadow: "-4px 0 30px rgba(44,35,32,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid rgba(44,35,32,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} style={{ color: DARK }} />
                <h2 className="text-lg font-semibold font-display" style={{ color: DARK }}>Your Bag</h2>
                {cart && cart.items.length > 0 && (
                  <span className="badge-blush ml-1">{cart.items.length}</span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(44,35,32,0.4)" }}
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(196,122,128,0.08)" }}>
                    <ShoppingBag size={28} style={{ color: "rgba(44,35,32,0.25)" }} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: DARK }}>Sign in to view your bag</p>
                    <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>Your saved items will appear here</p>
                  </div>
                  <Link to="/auth/login" onClick={() => setOpen(false)} className="btn-primary">Sign in</Link>
                </div>
              ) : isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 shimmer rounded-xl" />)}
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(196,122,128,0.08)" }}>
                    <ShoppingBag size={28} style={{ color: "rgba(44,35,32,0.25)" }} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: DARK }}>Your bag is empty</p>
                    <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>Discover our latest collections</p>
                  </div>
                  <Link to="/shop" onClick={() => setOpen(false)} className="btn-blush">Browse Collections</Link>
                </div>
              ) : (
                cart.items.map((item) => (
                  <motion.div
                    key={item.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                    className="rounded-xl p-3 flex gap-3"
                    style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}
                  >
                    <Link to={`/products/${item.product.slug}`} onClick={() => setOpen(false)}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "#f0e8e0" }}>
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} style={{ color: "rgba(44,35,32,0.2)" }} />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: DARK }}>{item.product.name}</p>
                      {item.product.brand && (
                        <p className="text-xs mt-0.5" style={{ color: "rgba(44,35,32,0.4)" }}>{item.product.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty */}
                        <div className="flex items-center gap-1.5 rounded-lg px-1 py-0.5"
                          style={{ background: "#f9f4ef", border: "1px solid rgba(44,35,32,0.1)" }}>
                          <button
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                            disabled={updateItem.isPending}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} style={{ color: DARK }} />
                          </button>
                          <span className="text-sm font-semibold w-5 text-center" style={{ color: DARK }}>{item.quantity}</span>
                          <button
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                            disabled={updateItem.isPending || item.quantity >= item.product.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} style={{ color: DARK }} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: DARK }}>
                            {toINR(parseFloat(item.product.price) * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem.mutate(item.id)}
                            className="transition-colors"
                            disabled={removeItem.isPending}
                            aria-label="Remove item"
                          >
                            <Trash2
                              size={13}
                              style={{ color: "rgba(44,35,32,0.3)" }}
                              onMouseEnter={e => (e.currentTarget as SVGElement).style.color = BLUSH}
                              onMouseLeave={e => (e.currentTarget as SVGElement).style.color = "rgba(44,35,32,0.3)"}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="p-4 space-y-3" style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "rgba(44,35,32,0.6)" }}>Subtotal</span>
                  <span className="text-lg font-bold font-display" style={{ color: DARK }}>{toINR(cart.subtotal)}</span>
                </div>
                <p className="text-xs" style={{ color: "rgba(44,35,32,0.4)" }}>Taxes & delivery calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="btn-outline w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
