import { motion } from "framer-motion";
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useState } from "react";
import type { OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "text-yellow-400 bg-yellow-400/10",  icon: <Clock size={13} /> },
  confirmed:  { label: "Confirmed",  color: "text-blue-400 bg-blue-400/10",     icon: <CheckCircle2 size={13} /> },
  processing: { label: "Processing", color: "text-purple-400 bg-purple-400/10", icon: <RefreshCw size={13} /> },
  shipped:    { label: "Shipped",    color: "text-aura-300 bg-aura-400/10",     icon: <Truck size={13} /> },
  delivered:  { label: "Delivered",  color: "text-emerald-400 bg-emerald-400/10", icon: <CheckCircle2 size={13} /> },
  cancelled:  { label: "Cancelled",  color: "text-red-400 bg-red-400/10",       icon: <XCircle size={13} /> },
  refunded:   { label: "Refunded",   color: "text-orange-400 bg-orange-400/10", icon: <RefreshCw size={13} /> },
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            My <span className="text-gold-gradient">Orders</span>
          </h1>
          <p className="text-white/40 text-sm">Track and manage your purchases</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}
          </div>
        ) : !data?.orders.length ? (
          <div className="text-center py-24">
            <Package size={56} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-xl mb-2">No orders yet</p>
            <p className="text-white/25 text-sm mb-8">Your order history will appear here</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.orders.map((order, i) => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/orders/${order.id}`}
                    className="glass-card-hover rounded-2xl p-5 flex items-center gap-4 block group"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-white/40" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white text-sm">{order.orderNumber}</p>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                        {" · "}
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-white">{toINR(order.total)}</p>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors ml-auto mt-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {data.pagination.total > data.pagination.limit && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.orders.length < data.pagination.limit}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
