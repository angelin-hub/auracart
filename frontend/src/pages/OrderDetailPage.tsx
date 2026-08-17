import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#f9f4ef";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "#d4a020", bg: "rgba(212,160,32,0.1)",   icon: <Clock size={14} /> },
  confirmed:  { label: "Confirmed",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   icon: <CheckCircle2 size={14} /> },
  processing: { label: "Processing", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   icon: <RefreshCw size={14} /> },
  shipped:    { label: "Shipped",    color: BLUSH,     bg: "rgba(196,122,128,0.1)",  icon: <Truck size={14} /> },
  delivered:  { label: "Delivered",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",    icon: <CheckCircle2 size={14} /> },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: <XCircle size={14} /> },
  refunded:   { label: "Refunded",   color: "#f97316", bg: "rgba(249,115,22,0.1)",   icon: <RefreshCw size={14} /> },
};

const STEPS: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 shimmer rounded w-1/3" />
          <div className="h-48 shimmer rounded-3xl" />
          <div className="h-64 shimmer rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-center" style={{ background: CREAM }}>
        <div>
          <Package size={48} style={{ color: "rgba(44,35,32,0.2)" }} className="mx-auto mb-4" />
          <p className="text-xl mb-4 font-display" style={{ color: "rgba(44,35,32,0.5)" }}>Order not found</p>
          <Link to="/orders" className="btn-primary">← My Orders</Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: CREAM }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "rgba(44,35,32,0.45)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = DARK}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(44,35,32,0.45)"}>
            <ArrowLeft size={15} /> Back to orders
          </button>

          <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: DARK }}>
                {order.orderNumber}
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(44,35,32,0.45)" }}>
                Placed {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ color: status.color, background: status.bg }}>
              {status.icon} {status.label}
            </span>
          </div>

          {/* Progress */}
          {!["cancelled","refunded"].includes(order.status) && (
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
              <h2 className="font-semibold text-sm mb-5" style={{ color: "rgba(44,35,32,0.6)" }}>
                Order Progress
              </h2>
              <div className="flex items-center">
                {STEPS.map((step, i) => {
                  const isCompleted = currentStepIdx >= i;
                  const isCurrent   = currentStepIdx === i;
                  const stepStatus  = STATUS_CONFIG[step];
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          style={{
                            background: isCompleted ? BLUSH : "rgba(44,35,32,0.08)",
                            color: isCompleted ? "white" : "rgba(44,35,32,0.3)",
                            boxShadow: isCurrent ? `0 0 0 3px rgba(196,122,128,0.3)` : "none",
                          }}>
                          {stepStatus.icon}
                        </div>
                        <span className="text-[10px] mt-1.5 font-medium"
                          style={{ color: isCompleted ? DARK : "rgba(44,35,32,0.3)" }}>
                          {stepStatus.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-px mx-1 transition-all"
                          style={{ background: currentStepIdx > i ? BLUSH : "rgba(44,35,32,0.1)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {order.estimatedDelivery && (
                <p className="text-xs text-center mt-4" style={{ color: "rgba(44,35,32,0.4)" }}>
                  Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </p>
              )}
              {order.trackingNumber && (
                <p className="text-xs text-center mt-1" style={{ color: BLUSH }}>
                  Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
            <h2 className="font-semibold mb-4" style={{ color: DARK }}>Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: "#f0e8e0" }}>
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} style={{ color: "rgba(44,35,32,0.2)" }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: DARK }}>{item.productName}</p>
                    <p className="text-xs" style={{ color: "rgba(44,35,32,0.4)" }}>
                      {toINR(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0" style={{ color: DARK }}>
                    {toINR(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Address + Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5"
              style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
              <div className="flex items-center gap-2 text-sm font-medium mb-3"
                style={{ color: "rgba(44,35,32,0.5)" }}>
                <MapPin size={15} style={{ color: BLUSH }} /> Shipping Address
              </div>
              <p className="text-sm font-medium" style={{ color: DARK }}>{order.shippingAddress.name}</p>
              <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              </p>
              <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </div>

            <div className="rounded-2xl p-5"
              style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
              <div className="flex items-center gap-2 text-sm font-medium mb-3"
                style={{ color: "rgba(44,35,32,0.5)" }}>
                <CreditCard size={15} style={{ color: BLUSH }} /> Payment Summary
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Subtotal", val: toINR(order.subtotal) },
                  { label: "Tax",      val: toINR(order.tax) },
                  { label: "Delivery", val: parseFloat(order.shipping) === 0 ? "Free" : toINR(order.shipping) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between" style={{ color: "rgba(44,35,32,0.5)" }}>
                    <span>{row.label}</span><span>{row.val}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2"
                  style={{ borderTop: "1px solid rgba(44,35,32,0.08)", color: DARK }}>
                  <span>Total</span>
                  <span style={{ color: BLUSH }}>{toINR(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
