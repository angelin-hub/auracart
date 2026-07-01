import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/useCart";
import { useAuthStore } from "@/store/authStore";
import { toINR } from "@/lib/currency";

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(34,46,80,0.3)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)} />

          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: "white", borderLeft: "1px solid rgba(34,46,80,0.1)", boxShadow: "-4px 0 24px rgba(34,46,80,0.12)" }}>

            {/* Header */}
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid rgba(34,46,80,0.08)" }}>
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} style={{ color: "#222E50" }} />
                <h2 className="text-lg font-semibold" style={{ color: "#222E50" }}>Your Cart</h2>
                {cart && cart.items.length > 0 && (
                  <span className="badge-gold ml-1">{cart.items.length}</span>
                )}
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-navy-600/8"
                style={{ color: "rgba(34,46,80,0.4)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(34,46,80,0.06)" }}>
                    <ShoppingBag size={28} style={{ color: "rgba(34,46,80,0.3)" }} />
                  </div>
                  <div>
                    <p className="font-medium mb-1" style={{ color: "#222E50" }}>Sign in to view cart</p>
                    <p className="text-sm" style={{ color: "rgba(34,46,80,0.5)" }}>Your items will be saved</p>
                  </div>
                  <Link to="/auth/login" onClick={() => setOpen(false)} className="btn-primary">Sign in</Link>
                </div>
              ) : isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-xl" />)}
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(34,46,80,0.06)" }}>
                    <ShoppingBag size={28} style={{ color: "rgba(34,46,80,0.3)" }} />
                  </div>
                  <div>
                    <p className="font-medium mb-1" style={{ color: "#222E50" }}>Your cart is empty</p>
                    <p className="text-sm" style={{ color: "rgba(34,46,80,0.5)" }}>Start adding luxury items</p>
                  </div>
                  <Link to="/shop" onClick={() => setOpen(false)} className="btn-navy">Browse Shop</Link>
                </div>
              ) : (
                cart.items.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                    className="rounded-xl p-3 flex gap-3"
                    style={{ background: "#EDF7F6", border: "1px solid rgba(34,46,80,0.08)" }}>
                    <Link to={`/products/${item.product.slug}`} onClick={() => setOpen(false)}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "rgba(34,46,80,0.06)" }}>
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} style={{ color: "rgba(34,46,80,0.2)" }} />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#222E50" }}>{item.product.name}</p>
                      {item.product.brand && (
                        <p className="text-xs mt-0.5" style={{ color: "rgba(34,46,80,0.4)" }}>{item.product.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty */}
                        <div className="flex items-center gap-1.5 rounded-lg px-1 py-0.5"
                          style={{ background: "white", border: "1px solid rgba(34,46,80,0.12)" }}>
                          <button onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-navy-600/8"
                            disabled={updateItem.isPending} aria-label="Decrease">
                            <Minus size={11} style={{ color: "#222E50" }} />
                          </button>
                          <span className="text-sm font-semibold w-5 text-center" style={{ color: "#222E50" }}>{item.quantity}</span>
                          <button onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-navy-600/8"
                            disabled={updateItem.isPending || item.quantity >= item.product.stock} aria-label="Increase">
                            <Plus size={11} style={{ color: "#222E50" }} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: "#222E50" }}>
                            {toINR(parseFloat(item.product.price) * item.quantity)}
                          </span>
                          <button onClick={() => removeItem.mutate(item.id)}
                            className="transition-colors" disabled={removeItem.isPending} aria-label="Remove">
                            <Trash2 size={13} style={{ color: "rgba(34,46,80,0.3)" }}
                              onMouseEnter={e => (e.currentTarget as SVGElement).style.color = "#dc2626"}
                              onMouseLeave={e => (e.currentTarget as SVGElement).style.color = "rgba(34,46,80,0.3)"} />
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
              <div className="p-4 space-y-3" style={{ borderTop: "1px solid rgba(34,46,80,0.08)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "rgba(34,46,80,0.6)" }}>Subtotal</span>
                  <span className="text-lg font-bold" style={{ color: "#222E50" }}>{toINR(cart.subtotal)}</span>
                </div>
                <p className="text-xs" style={{ color: "rgba(34,46,80,0.4)" }}>Tax & delivery calculated at checkout</p>
                <Link to="/checkout" onClick={() => setOpen(false)}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  Checkout <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
