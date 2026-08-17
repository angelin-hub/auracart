import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import type { ShippingAddress } from "@/types";
import { toINR } from "@/lib/currency";

const EMPTY_ADDRESS: ShippingAddress = {
  name: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "IN", phone: "",
};

export default function CheckoutPage() {
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"address" | "review" | "success">("address");

  const set = (key: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setAddress((a) => ({ ...a, [key]: e.target.value }));

  const isAddressValid =
    address.name && address.line1 && address.city && address.state && address.postalCode;

  const subtotal = cart?.subtotal ?? 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async () => {
    try {
      await createOrder.mutateAsync({ shippingAddress: address, notes });
      setStep("success");
    } catch {
      // error handled by hook
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4" style={{ background: "#f9f4ef" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,197,94,0.12)" }}>
            <CheckCircle2 size={44} style={{ color: "#22c55e" }} />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-3" style={{ color: "#2c2320" }}>
            Order Confirmed!
          </h1>
          <p className="text-sm mb-2" style={{ color: "rgba(44,35,32,0.55)" }}>
            Your order has been placed successfully.
          </p>
          <p className="text-sm mb-8" style={{ color: "rgba(44,35,32,0.35)" }}>
            You'll receive a confirmation shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/orders" className="btn-primary flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> View Orders
            </Link>
            <Link to="/shop" className="btn-outline flex items-center justify-center gap-2">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4 text-center"
        style={{ background: "#f9f4ef" }}>
        <div>
          <ShoppingBag size={48} style={{ color: "rgba(44,35,32,0.15)" }} className="mx-auto mb-4" />
          <p className="text-xl mb-4 font-display" style={{ color: "rgba(44,35,32,0.4)" }}>Your bag is empty</p>
          <Link to="/shop" className="btn-primary">Browse Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#f9f4ef" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: "#2c2320" }}>Checkout</h1>

          {/* Steps */}
          <div className="flex items-center gap-2 mt-4">
            {["address","review"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px" style={{ background: "rgba(44,35,32,0.12)" }} />}
                <div className={`flex items-center gap-1.5 text-sm font-medium`}
                  style={{ color: step === s ? "#2c2320" : step === "review" && s === "address" ? "#22c55e" : "rgba(44,35,32,0.3)" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: step === s ? "#c47a80" : step === "review" && s === "address" ? "#22c55e" : "rgba(44,35,32,0.1)",
                      color: step === s || (step === "review" && s === "address") ? "white" : "rgba(44,35,32,0.3)",
                    }}>
                    {step === "review" && s === "address" ? "✓" : i + 1}
                  </div>
                  <span className="capitalize hidden sm:block">{s}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {step === "address" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-3xl p-6 md:p-8"
                style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
                <h2 className="text-xl font-display font-semibold mb-6" style={{ color: "#2c2320" }}>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="fullname"
                      style={{ color: "rgba(44,35,32,0.65)" }}>Full name *</label>
                    <input id="fullname" type="text" value={address.name} onChange={set("name")}
                      className="input-luxury" placeholder="Your name" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="line1"
                      style={{ color: "rgba(44,35,32,0.65)" }}>Address line 1 *</label>
                    <input id="line1" type="text" value={address.line1} onChange={set("line1")}
                      className="input-luxury" placeholder="House / flat no., street" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="line2"
                      style={{ color: "rgba(44,35,32,0.65)" }}>Address line 2</label>
                    <input id="line2" type="text" value={address.line2 ?? ""} onChange={set("line2")}
                      className="input-luxury" placeholder="Landmark, area (optional)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="city"
                      style={{ color: "rgba(44,35,32,0.65)" }}>City *</label>
                    <input id="city" type="text" value={address.city} onChange={set("city")}
                      className="input-luxury" placeholder="Mumbai" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="state"
                      style={{ color: "rgba(44,35,32,0.65)" }}>State *</label>
                    <input id="state" type="text" value={address.state} onChange={set("state")}
                      className="input-luxury" placeholder="Maharashtra" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="postalCode"
                      style={{ color: "rgba(44,35,32,0.65)" }}>PIN Code *</label>
                    <input id="postalCode" type="text" value={address.postalCode} onChange={set("postalCode")}
                      className="input-luxury" placeholder="400001" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="phone"
                      style={{ color: "rgba(44,35,32,0.65)" }}>Phone</label>
                    <input id="phone" type="tel" value={address.phone ?? ""} onChange={set("phone")}
                      className="input-luxury" placeholder="+91 98765 43210" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="notes"
                      style={{ color: "rgba(44,35,32,0.65)" }}>Order notes</label>
                    <input id="notes" type="text" value={notes} onChange={e => setNotes(e.target.value)}
                      className="input-luxury" placeholder="Special delivery instructions (optional)" />
                  </div>
                </div>
                <button onClick={() => setStep("review")} disabled={!isAddressValid}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-xl mt-6 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Review <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-3xl p-6 md:p-8"
                style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
                <h2 className="text-xl font-display font-semibold mb-6" style={{ color: "#2c2320" }}>
                  Review Order
                </h2>
                {/* Address summary */}
                <div className="rounded-2xl p-4 mb-6"
                  style={{ background: "#f9f4ef", border: "1px solid rgba(44,35,32,0.07)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium" style={{ color: "rgba(44,35,32,0.6)" }}>Shipping to</p>
                    <button onClick={() => setStep("address")} className="text-xs font-medium hover:underline"
                      style={{ color: "#c47a80" }}>Edit</button>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "#2c2320" }}>{address.name}</p>
                  <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
                    {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
                {/* Items */}
                <div className="space-y-3 mb-6">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: "#f0e8e0" }}>
                        {item.product.images?.[0] && (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#2c2320" }}>{item.product.name}</p>
                        <p className="text-xs" style={{ color: "rgba(44,35,32,0.4)" }}>Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#2c2320" }}>
                        {toINR(parseFloat(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("address")}
                    className="btn-outline flex items-center gap-2 py-3 rounded-xl flex-shrink-0">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={createOrder.isPending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl disabled:opacity-50">
                    {createOrder.isPending ? <Loader2 size={16} className="animate-spin" /> : <>Place Order <ArrowRight size={16} /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-6 sticky top-24"
              style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
              <h3 className="font-display font-semibold mb-5" style={{ color: "#2c2320" }}>Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between" style={{ color: "rgba(44,35,32,0.55)" }}>
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>{toINR(subtotal)}</span>
                </div>
                <div className="flex justify-between" style={{ color: "rgba(44,35,32,0.55)" }}>
                  <span>GST (18%)</span>
                  <span>{toINR(tax)}</span>
                </div>
                <div className="flex justify-between" style={{ color: "rgba(44,35,32,0.55)" }}>
                  <span>Delivery</span>
                  <span>{shipping === 0 ? <span style={{ color: "#22c55e" }}>Free</span> : toINR(shipping)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs" style={{ color: "rgba(34,197,94,0.7)" }}>
                    Free delivery on orders over ₹999
                  </p>
                )}
              </div>
              <div className="pt-4 mt-4 flex justify-between font-display font-semibold"
                style={{ borderTop: "1px solid rgba(44,35,32,0.08)", color: "#2c2320" }}>
                <span>Total</span>
                <span style={{ color: "#c47a80" }}>{toINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
