import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Loader2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  processing: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  shipped:    "text-aura-300 bg-aura-400/10 border-aura-400/20",
  delivered:  "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled:  "text-red-400 bg-red-400/10 border-red-400/20",
  refunded:   "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ id: string; tracking: string } | null>(null);

  const { data, isLoading } = useAdminOrders(page, statusFilter || undefined);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    await updateStatus.mutateAsync({ id, status });
    setUpdating(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
          <p className="text-white/40 text-sm mt-1">
            {data?.pagination.total ?? 0} total orders
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {["", ...STATUSES].map((s) => (
            <button
              key={s || "all"}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize border ${
                statusFilter === s
                  ? "bg-aura-500/20 text-aura-200 border-aura-400/30"
                  : "text-white/40 hover:text-white border-transparent hover:border-white/10"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider hidden sm:table-cell">Customer</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/3">
                      <td colSpan={6} className="px-5 py-3"><div className="h-9 shimmer rounded-lg" /></td>
                    </tr>
                  ))
                ) : data?.orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-white/30">
                      <ShoppingBag size={32} className="mx-auto mb-3 text-white/10" />
                      No orders found
                    </td>
                  </tr>
                ) : (
                  data?.orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/orders/${order.id}`} className="font-medium text-white/90 hover:text-white transition-colors">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <p className="text-white/70">{order.user?.name ?? "—"}</p>
                        <p className="text-xs text-white/25">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white">{toINR(order.total)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className={`pl-2.5 pr-6 py-1 rounded-lg text-xs font-medium border appearance-none cursor-pointer outline-none disabled:opacity-50 ${STATUS_COLORS[order.status as OrderStatus]}`}
                            style={{ background: "transparent" }}
                            aria-label="Order status"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-aura-900 text-white capitalize">{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-xs hidden md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setTrackingModal({ id: order.id, tracking: order.trackingNumber || "" })}
                            className="text-xs text-aura-300 hover:text-aura-200 transition-colors px-2 py-1 rounded-lg hover:bg-aura-500/10"
                          >
                            Tracking
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {data && data.pagination.total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline px-4 py-2 text-sm disabled:opacity-30">
              Previous
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={data.orders.length < 20} className="btn-outline px-4 py-2 text-sm disabled:opacity-30">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setTrackingModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm glass-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">Update Tracking</h3>
                <button onClick={() => setTrackingModal(null)} className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5" aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <label className="block text-xs text-white/40 mb-1.5">Tracking Number</label>
              <input
                type="text"
                value={trackingModal.tracking}
                onChange={(e) => setTrackingModal((t) => t ? { ...t, tracking: e.target.value } : null)}
                placeholder="e.g. 1Z999AA10123456784"
                className="input-luxury text-sm mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setTrackingModal(null)} className="btn-outline flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
                <button
                  onClick={async () => {
                    await updateStatus.mutateAsync({ id: trackingModal.id, status: "shipped", trackingNumber: trackingModal.tracking });
                    setTrackingModal(null);
                  }}
                  disabled={updateStatus.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm disabled:opacity-50"
                >
                  {updateStatus.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
