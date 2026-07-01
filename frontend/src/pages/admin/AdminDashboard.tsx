import { motion } from "framer-motion";
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminStats } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import { toINR } from "@/lib/currency";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "text-yellow-400",
  confirmed:  "text-blue-400",
  processing: "text-purple-400",
  shipped:    "text-aura-300",
  delivered:  "text-emerald-400",
  cancelled:  "text-red-400",
  refunded:   "text-orange-400",
};

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();

  const stats = [
    {
      label: "Total Revenue",
      value: data ? toINR(data.stats.totalRevenue) : "—",
      icon: <DollarSign size={20} />,
      color: "from-gold-400 to-gold-600",
      bg: "bg-gold-400/10",
    },
    {
      label: "Total Orders",
      value: data ? data.stats.totalOrders.toLocaleString() : "—",
      icon: <ShoppingBag size={20} />,
      color: "from-aura-400 to-aura-600",
      bg: "bg-aura-400/10",
    },
    {
      label: "Customers",
      value: data ? data.stats.totalUsers.toLocaleString() : "—",
      icon: <Users size={20} />,
      color: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Products",
      value: data ? data.stats.totalProducts.toLocaleString() : "—",
      icon: <Package size={20} />,
      color: "from-purple-400 to-purple-600",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-gold text-xs px-2 py-0.5">Admin</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">Welcome back. Here's what's happening.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-5"
            >
              {isLoading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 shimmer rounded-xl" />
                  <div className="h-7 shimmer rounded w-1/2" />
                  <div className="h-4 shimmer rounded w-2/3" />
                </div>
              ) : (
                <>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <span className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                      {stat.icon}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Manage Products", desc: "Add, edit, or remove products", href: "/admin/products", icon: <Package size={18} /> },
            { label: "Manage Orders", desc: "View and update order status", href: "/admin/orders", icon: <ShoppingBag size={18} /> },
            { label: "Analytics", desc: "Revenue and performance metrics", href: "#", icon: <TrendingUp size={18} /> },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="glass-card-hover rounded-2xl p-5 flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-aura-500/10 flex items-center justify-center text-aura-300 flex-shrink-0">
                {link.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{link.label}</p>
                <p className="text-xs text-white/30 mt-0.5">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-aura-300 hover:text-aura-200 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 shimmer rounded-xl" />)}
            </div>
          ) : data?.recentOrders.length ? (
            <div className="space-y-2">
              {data.recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={14} className="text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{order.orderNumber}</p>
                    <p className="text-xs text-white/30">{order.userName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">{toINR(order.total)}</p>
                    <p className={`text-xs capitalize ${STATUS_COLORS[order.status as OrderStatus] || "text-white/40"}`}>
                      {order.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-8">No orders yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
