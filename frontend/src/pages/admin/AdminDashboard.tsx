import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Warehouse,
} from "lucide-react";
import { useAdminStats } from "@/hooks/useOrders";
import { useAdminProducts } from "@/hooks/useProducts";
import { toINR } from "@/lib/currency";

// ── Design tokens ──────────────────────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid rgba(44,35,32,0.08)",
  boxShadow: "0 2px 8px rgba(44,35,32,0.06)",
  borderRadius: 16,
};

const STATUS_BADGE: Record<
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}
function StatCard({ label, value, icon, loading }: StatCardProps) {
  return (
    <div style={CARD_STYLE} className="p-5">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="w-11 h-11" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : (
        <>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "rgba(196,122,128,0.12)" }}
          >
            <span style={{ color: "#c47a80" }}>{icon}</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#2c2320" }}>
            {value}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
            {label}
          </p>
        </>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_BADGE[status] ?? STATUS_BADGE["pending"];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-0.5 border capitalize"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.text }}
      />
      {status}
    </span>
  );
}

// ── CSS Bar Chart ─────────────────────────────────────────────────────────────
const MOCK_BARS = [
  { label: "Mon", value: 65 },
  { label: "Tue", value: 80 },
  { label: "Wed", value: 45 },
  { label: "Thu", value: 90 },
  { label: "Fri", value: 72 },
  { label: "Sat", value: 55 },
  { label: "Sun", value: 38 },
];

function SalesChart() {
  return (
    <div style={CARD_STYLE} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold" style={{ color: "#2c2320" }}>
            Sales Overview
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(44,35,32,0.4)" }}>
            Last 7 days activity
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} style={{ color: "#22c55e" }} />
          <span className="text-sm font-medium" style={{ color: "#22c55e" }}>
            +12.4%
          </span>
        </div>
      </div>
      <div className="flex items-end gap-2 sm:gap-3 h-32">
        {MOCK_BARS.map((bar) => (
          <div
            key={bar.label}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${bar.value}%`,
                backgroundColor: "#c47a80",
                opacity: 0.3 + (bar.value / 100) * 0.7,
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: "rgba(44,35,32,0.4)" }}
            >
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent Order row type ─────────────────────────────────────────────────────
interface RecentOrder {
  id: string;
  orderNumber: string;
  userName?: string;
  total: string | number;
  status: string;
  createdAt: string;
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useAdminStats();
  const { data: productsData, isLoading: productsLoading } = useAdminProducts({
    page: 1,
  });

  const stats = statsData?.stats;
  const recentOrders: RecentOrder[] = statsData?.recentOrders ?? [];
  const lowStockProducts =
    productsData?.products.filter((p) => p.stock < 10) ?? [];

  return (
    <div
      className="p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#f9f4ef", minHeight: "100%" }}
    >
      {/* Welcome header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: "#2c2320" }}>
          Welcome back 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(44,35,32,0.5)" }}>
          Here's what's happening at Yehovah Boutique today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Products"
          value={stats ? stats.totalProducts.toLocaleString() : "—"}
          icon={<Package size={20} />}
          loading={statsLoading}
        />
        <StatCard
          label="Total Orders"
          value={stats ? stats.totalOrders.toLocaleString() : "—"}
          icon={<ShoppingBag size={20} />}
          loading={statsLoading}
        />
        <StatCard
          label="Total Customers"
          value={stats ? stats.totalUsers.toLocaleString() : "—"}
          icon={<Users size={20} />}
          loading={statsLoading}
        />
        <StatCard
          label="Total Revenue"
          value={stats ? toINR(stats.totalRevenue) : "—"}
          icon={<DollarSign size={20} />}
          loading={statsLoading}
        />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div style={CARD_STYLE} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "#2c2320" }}>
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: "#c47a80" }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "rgba(44,35,32,0.35)" }}
            >
              No recent orders
            </p>
          ) : (
            <div className="space-y-0">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "#2c2320" }}
                    >
                      {order.orderNumber}
                    </p>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: "rgba(44,35,32,0.4)" }}
                    >
                      {order.userName ?? "Customer"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-3">
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: "#2c2320" }}
                    >
                      {toINR(order.total)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div style={CARD_STYLE} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "#2c2320" }}>
              Low Stock
            </h3>
            <Link
              to="/admin/inventory"
              className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: "#c47a80" }}
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "rgba(44,35,32,0.35)" }}
            >
              All products well stocked ✓
            </p>
          ) : (
            <div className="space-y-0">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 py-2.5"
                  style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                >
                  <div
                    className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: "rgba(44,35,32,0.06)" }}
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={14}
                          style={{ color: "rgba(44,35,32,0.25)" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "#2c2320" }}
                    >
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle
                        size={11}
                        style={{
                          color:
                            product.stock === 0 ? "#ef4444" : "#f59e0b",
                        }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            product.stock === 0 ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        {product.stock === 0
                          ? "Out of stock"
                          : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={CARD_STYLE} className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: "#2c2320" }}>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2c2320", color: "white" }}
            >
              <Plus size={16} />
              Add New Product
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "white",
                color: "#2c2320",
                border: "1.5px solid rgba(44,35,32,0.18)",
              }}
            >
              <ShoppingBag size={16} />
              View All Orders
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "white",
                color: "#2c2320",
                border: "1.5px solid rgba(44,35,32,0.18)",
              }}
            >
              <Package size={16} />
              Manage Categories
            </Link>
            <Link
              to="/admin/inventory"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "rgba(196,122,128,0.08)",
                color: "#c47a80",
                border: "1.5px solid rgba(196,122,128,0.2)",
              }}
            >
              <Warehouse size={16} />
              Check Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <SalesChart />
    </div>
  );
}
