import { useState, useEffect } from "react";
import {
  Search,
  X,
  ChevronDown,
  Loader2,
  ShoppingBag,
  MapPin,
  Package,
} from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  pending:    { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  confirmed:  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  processing: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  shipped:    { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
  delivered:  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  cancelled:  { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
  refunded:   { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "rgba(44,35,32,0.07)" }}
    />
  );
}

// ── Order Detail Panel ────────────────────────────────────────────────────────
interface DetailPanelProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string, tracking?: string) => void;
  updating: boolean;
}

function OrderDetailPanel({
  order,
  open,
  onClose,
  onStatusChange,
  updating,
}: DetailPanelProps) {
  const [trackingInput, setTrackingInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setTrackingInput(order.trackingNumber ?? "");
    }
  }, [order]);

  if (!order) return null;

  const addr = order.shippingAddress;

  const TIMELINE = [
    { status: "pending", label: "Order Placed" },
    { status: "confirmed", label: "Confirmed" },
    { status: "processing", label: "Processing" },
    { status: "shipped", label: "Shipped" },
    { status: "delivered", label: "Delivered" },
  ];

  const currentIdx = TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(600px, 100vw)",
          backgroundColor: "white",
          boxShadow: "-8px 0 32px rgba(44,35,32,0.12)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(44,35,32,0.08)" }}
        >
          <div>
            <h2
              className="font-semibold text-lg"
              style={{ color: "#2c2320" }}
            >
              {order.orderNumber}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(44,35,32,0.4)" }}>
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl"
            style={{ color: "rgba(44,35,32,0.4)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Order Timeline */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(44,35,32,0.4)" }}
            >
              Order Timeline
            </p>
            <div className="flex items-center">
              {TIMELINE.map((step, idx) => {
                const done = idx <= currentIdx;
                const isLast = idx === TIMELINE.length - 1;
                return (
                  <div key={step.status} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: done
                            ? "#c47a80"
                            : "rgba(44,35,32,0.1)",
                          color: done ? "white" : "rgba(44,35,32,0.3)",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <p
                        className="text-[9px] mt-1 text-center"
                        style={{
                          color: done
                            ? "#2c2320"
                            : "rgba(44,35,32,0.35)",
                          maxWidth: 48,
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                    {!isLast && (
                      <div
                        className="flex-1 h-0.5 -mt-4 mx-1"
                        style={{
                          backgroundColor:
                            idx < currentIdx
                              ? "#c47a80"
                              : "rgba(44,35,32,0.1)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(44,35,32,0.4)" }}
            >
              Items ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: "rgba(44,35,32,0.06)" }}
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={16}
                          style={{ color: "rgba(44,35,32,0.2)" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "#2c2320" }}
                    >
                      {item.productName}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(44,35,32,0.45)" }}
                    >
                      Qty: {item.quantity} × {toINR(item.price)}
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold flex-shrink-0"
                    style={{ color: "#2c2320" }}
                  >
                    {toINR(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ backgroundColor: "#fdf8f3" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(44,35,32,0.4)" }}
            >
              Totals
            </p>
            {[
              { label: "Subtotal", value: order.subtotal },
              { label: "Shipping", value: order.shipping },
              { label: "Tax", value: order.tax },
              ...(parseFloat(order.discount) > 0
                ? [{ label: "Discount", value: `-${order.discount}` }]
                : []),
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between text-sm"
              >
                <span style={{ color: "rgba(44,35,32,0.5)" }}>
                  {row.label}
                </span>
                <span style={{ color: "#2c2320" }}>{toINR(row.value)}</span>
              </div>
            ))}
            <div
              className="flex justify-between text-sm font-bold pt-2"
              style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}
            >
              <span style={{ color: "#2c2320" }}>Total</span>
              <span style={{ color: "#2c2320" }}>{toINR(order.total)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1"
              style={{ color: "rgba(44,35,32,0.4)" }}
            >
              <MapPin size={11} /> Shipping Address
            </p>
            <div
              className="rounded-xl p-4 text-sm space-y-0.5"
              style={{
                backgroundColor: "white",
                border: "1px solid rgba(44,35,32,0.08)",
              }}
            >
              <p className="font-medium" style={{ color: "#2c2320" }}>
                {addr.name}
              </p>
              <p style={{ color: "rgba(44,35,32,0.55)" }}>
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
              </p>
              <p style={{ color: "rgba(44,35,32,0.55)" }}>
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p style={{ color: "rgba(44,35,32,0.55)" }}>{addr.country}</p>
              {addr.phone && (
                <p style={{ color: "rgba(44,35,32,0.55)" }}>{addr.phone}</p>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(44,35,32,0.4)" }}
            >
              Update Status
            </p>
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    backgroundColor: "white",
                    border: "1.5px solid rgba(44,35,32,0.15)",
                    borderRadius: 12,
                    padding: "10px 36px 10px 16px",
                    color: "#2c2320",
                    outline: "none",
                    width: "100%",
                    fontSize: 14,
                    appearance: "none",
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(44,35,32,0.4)" }}
                />
              </div>

              <input
                type="text"
                placeholder="Tracking number (optional)"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                style={{
                  backgroundColor: "white",
                  border: "1.5px solid rgba(44,35,32,0.15)",
                  borderRadius: 12,
                  padding: "10px 16px",
                  color: "#2c2320",
                  outline: "none",
                  width: "100%",
                  fontSize: 14,
                }}
              />

              <button
                onClick={() =>
                  onStatusChange(order.id, selectedStatus, trackingInput)
                }
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#2c2320", color: "white" }}
              >
                {updating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Update Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading } = useAdminOrders(page, statusFilter || undefined);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (
    id: string,
    status: string,
    trackingNumber?: string
  ) => {
    setUpdatingId(id);
    await updateStatus.mutateAsync({ id, status, trackingNumber });
    setUpdatingId(null);
    setDetailOpen(false);
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  // Client-side search filter
  const displayOrders = (data?.orders ?? []).filter((o: Order & { user?: { name?: string; email?: string } }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.user?.name ?? "").toLowerCase().includes(q)
    );
  });

  const tabStatuses = ["", ...STATUSES, "refunded"];

  return (
    <div
      className="p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#f9f4ef", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: "#2c2320" }}>
          Orders
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
          {data?.pagination.total ?? 0} total orders
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 flex-wrap mb-4 overflow-x-auto pb-1">
        {tabStatuses.map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap"
            style={
              statusFilter === s
                ? {
                    backgroundColor: "#2c2320",
                    color: "white",
                  }
                : {
                    backgroundColor: "white",
                    color: "rgba(44,35,32,0.6)",
                    border: "1px solid rgba(44,35,32,0.1)",
                  }
            }
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(44,35,32,0.35)" }}
        />
        <input
          type="text"
          placeholder="Search by order # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            backgroundColor: "white",
            border: "1.5px solid rgba(44,35,32,0.15)",
            borderRadius: 12,
            padding: "9px 16px 9px 36px",
            color: "#2c2320",
            outline: "none",
            width: "100%",
            fontSize: 14,
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "white",
          border: "1px solid rgba(44,35,32,0.08)",
          boxShadow: "0 2px 8px rgba(44,35,32,0.06)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#fdf8f3" }}>
                {[
                  "Order #",
                  "Customer",
                  "Items",
                  "Total",
                  "Payment",
                  "Status",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(44,35,32,0.5)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                  >
                    <td colSpan={8} className="py-3 px-4">
                      <Skeleton className="h-10" />
                    </td>
                  </tr>
                ))
              ) : displayOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16"
                    style={{ color: "rgba(44,35,32,0.35)" }}
                  >
                    <ShoppingBag
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: "rgba(44,35,32,0.15)" }}
                    />
                    No orders found
                  </td>
                </tr>
              ) : (
                displayOrders.map((order: Order & { user?: { name?: string; email?: string } }) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "rgba(44,35,32,0.02)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "")
                    }
                  >
                    {/* Order # */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openDetail(order)}
                        className="font-medium hover:underline"
                        style={{ color: "#c47a80" }}
                      >
                        {order.orderNumber}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <p
                        className="font-medium"
                        style={{ color: "#2c2320" }}
                      >
                        {order.user?.name ?? order.shippingAddress.name}
                      </p>
                      {order.user?.email && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(44,35,32,0.4)" }}
                        >
                          {order.user.email}
                        </p>
                      )}
                    </td>

                    {/* Items */}
                    <td
                      className="py-3 px-4 text-sm"
                      style={{ color: "rgba(44,35,32,0.6)" }}
                    >
                      {order.items.length}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4">
                      <span className="font-semibold" style={{ color: "#2c2320" }}>
                        {toINR(order.total)}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex rounded-full text-xs font-medium px-2 py-0.5 capitalize"
                        style={
                          order.paymentStatus === "paid"
                            ? { backgroundColor: "#f0fdf4", color: "#15803d" }
                            : order.paymentStatus === "failed"
                            ? { backgroundColor: "#fef2f2", color: "#b91c1c" }
                            : {
                                backgroundColor: "#fffbeb",
                                color: "#b45309",
                              }
                        }
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3 px-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={updatingId === order.id}
                          className="text-xs font-medium rounded-full px-2.5 py-1 border appearance-none pr-6 cursor-pointer disabled:opacity-50 capitalize"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[order.status]?.bg ?? "#fff",
                            color:
                              STATUS_COLORS[order.status]?.text ?? "#374151",
                            borderColor:
                              STATUS_COLORS[order.status]?.border ?? "#e5e7eb",
                          }}
                          aria-label="Change order status"
                        >
                          {[...STATUSES, "refunded"].map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-gray-800"
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={10}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            color: STATUS_COLORS[order.status]?.text ?? "#374151",
                          }}
                        />
                      </div>
                    </td>

                    {/* Date */}
                    <td
                      className="py-3 px-4 text-xs"
                      style={{ color: "rgba(44,35,32,0.45)" }}
                    >
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openDetail(order)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          color: "#2c2320",
                          border: "1px solid rgba(44,35,32,0.15)",
                          backgroundColor: "white",
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && (data.pagination.total ?? 0) > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{
              border: "1.5px solid rgba(44,35,32,0.2)",
              color: "#2c2320",
              backgroundColor: "white",
            }}
          >
            Previous
          </button>
          <span
            className="px-4 py-2 text-sm"
            style={{ color: "rgba(44,35,32,0.5)" }}
          >
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(data?.orders.length ?? 0) < 20}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{
              border: "1.5px solid rgba(44,35,32,0.2)",
              color: "#2c2320",
              backgroundColor: "white",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Slide-in Panel */}
      <OrderDetailPanel
        order={selectedOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={handleStatusChange}
        updating={updateStatus.isPending}
      />
    </div>
  );
}
