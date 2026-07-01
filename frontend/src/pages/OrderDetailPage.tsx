import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "text-yellow-400 bg-yellow-400/10",  icon: <Clock size={14} /> },
  confirmed:  { label: "Confirmed",  color: "text-blue-400 bg-blue-400/10",     icon: <CheckCircle2 size={14} /> },
  processing: { label: "Processing", color: "text-purple-400 bg-purple-400/10", icon: <RefreshCw size={14} /> },
  shipped:    { label: "Shipped",    color: "text-aura-300 bg-aura-400/10",     icon: <Truck size={14} /> },
  delivered:  { label: "Delivered",  color: "text-emerald-400 bg-emerald-400/10", icon: <CheckCircle2 size={14} /> },
  cancelled:  { label: "Cancelled",  color: "text-red-400 bg-red-400/10",       icon: <XCircle size={14} /> },
  refunded:   { label: "Refunded",   color: "text-orange-400 bg-orange-400/10", icon: <RefreshCw size={14} /> },
};

const STEPS: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4">
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
      <div className="min-h-screen pt-24 flex items-center justify-center text-center">
        <div>
          <Package size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-xl">Order not found</p>
          <Link to="/orders" className="mt-4 inline-block text-aura-300 hover:underline">← My orders</Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={15} />
            Back to orders
          </button>

          <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                {order.orderNumber}
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Placed {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Progress tracker */}
          {!["cancelled", "refunded"].includes(order.status) && (
            <div className="glass-card rounded-3xl p-6 mb-4">
              <h2 className="font-semibold text-white/70 text-sm mb-5">Order Progress</h2>
              <div className="flex items-center">
                {STEPS.map((step, i) => {
                  const isCompleted = currentStepIdx >= i;
                  const isCurrent = currentStepIdx === i;
                  const stepStatus = STATUS_CONFIG[step];
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ? "bg-aura-500 text-white" : "bg-white/10 text-white/20"
                        } ${isCurrent ? "ring-2 ring-aura-400 ring-offset-2 ring-offset-transparent" : ""}`}>
                          {stepStatus.icon}
                        </div>
                        <span className={`text-[10px] mt-1.5 font-medium ${
                          isCompleted ? "text-white/60" : "text-white/20"
                        }`}>{stepStatus.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-1 transition-all ${
                          currentStepIdx > i ? "bg-aura-500" : "bg-white/10"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {order.estimatedDelivery && (
                <p className="text-xs text-white/30 mt-4 text-center">
                  Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric"
                  })}
                </p>
              )}
              {order.trackingNumber && (
                <p className="text-xs text-aura-300 mt-1 text-center">
                  Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="glass-card rounded-3xl p-6 mb-4">
            <h2 className="font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{item.productName}</p>
                    <p className="text-xs text-white/30">
                      {toINR(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white flex-shrink-0">
                    {toINR(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grid: Address + Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-3">
                <MapPin size={15} />
                Shipping Address
              </div>
              <p className="text-sm text-white/80">{order.shippingAddress.name}</p>
              <p className="text-sm text-white/50 mt-0.5">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              </p>
              <p className="text-sm text-white/50">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </div>

            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-3">
                <CreditCard size={15} />
                Payment Summary
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>{toINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Tax</span>
                  <span>{toINR(order.tax)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Delivery</span>
                  <span>{parseFloat(order.shipping) === 0 ? "Free" : toINR(order.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-gold-400">{toINR(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
