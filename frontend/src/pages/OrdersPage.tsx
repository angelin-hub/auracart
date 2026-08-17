import { motion } from "framer-motion";
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useState } from "react";
import type { OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#f9f4ef";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "#d4a020", bg: "rgba(212,160,32,0.1)",   icon: <Clock size={13} /> },
  confirmed:  { label: "Confirmed",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   icon: <CheckCircle2 size={13} /> },
  processing: { label: "Processing", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   icon: <RefreshCw size={13} /> },
  shipped:    { label: "Shipped",    color: BLUSH,     bg: "rgba(196,122,128,0.1)",  icon: <Truck size={13} /> },
  delivered:  { label: "Delivered",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",    icon: <CheckCircle2 size={13} /> },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: <XCircle size={13} /> },
  refunded:   { label: "Refunded",   color: "#f97316", bg: "rgba(249,115,22,0.1)",   icon: <RefreshCw size={13} /> },
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: CREAM }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BLUSH }}>
            Your Purchases
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-1" style={{ color: DARK }}>
            My Orders
          </h1>
          <p className="text-sm" style={{ color: "rgba(44,35,32,0.45)" }}>Track and manage your purchases</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}
          </div>
        ) : !data?.orders.length ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: "rgba(196,122,128,0.1)" }}>
              <Package size={36} style={{ color: "rgba(196,122,128,0.4)" }} />
            </div>
            <p className="text-xl font-display font-semibold mb-2" style={{ color: "rgba(44,35,32,0.4)" }}>
              No orders yet
            </p>
            <p className="text-sm mb-8" style={{ color: "rgba(44,35,32,0.3)" }}>
              Your order history will appear here
            </p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.orders.map((order, i) => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/orders/${order.id}`}
                    className="rounded-2xl p-5 flex items-center gap-4 block group transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "white",
                      border: "1px solid rgba(44,35,32,0.08)",
                      boxShadow: "0 2px 12px rgba(44,35,32,0.05)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(44,35,32,0.1)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,122,128,0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(44,35,32,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,35,32,0.08)";
                    }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(196,122,128,0.08)" }}>
                      <Package size={20} style={{ color: BLUSH }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm" style={{ color: DARK }}>{order.orderNumber}</p>
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: status.color, background: status.bg }}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "rgba(44,35,32,0.4)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                        {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-semibold" style={{ color: DARK }}>{toINR(order.total)}</p>
                      <ChevronRight size={16} className="ml-auto mt-1 transition-colors"
                        style={{ color: "rgba(44,35,32,0.2)" }} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {data.pagination.total > data.pagination.limit && (
              <div className="flex justify-center gap-2 pt-4">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-30">Previous</button>
                <button onClick={() => setPage((p) => p + 1)}
                  disabled={data.orders.length < data.pagination.limit}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-30">Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
