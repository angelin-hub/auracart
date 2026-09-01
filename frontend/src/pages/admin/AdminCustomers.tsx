import { useState } from "react";
import { Search, Users, Shield, User, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";

const INPUT: React.CSSProperties = {
  backgroundColor: "white",
  border: "1.5px solid rgba(44,35,32,0.15)",
  borderRadius: 12,
  padding: "8px 14px",
  color: DARK,
  outline: "none",
  fontSize: 14,
};

interface Customer {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  createdAt: string;
  orderCount?: number;
}

function useCustomers(page: number, search: string) {
  return useQuery({
    queryKey: ["admin-customers", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const { data } = await api.get(`/auth/users?${params.toString()}`);
      return data.data as { users: Customer[]; pagination: { total: number; pages: number } };
    },
  });
}

function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 border"
      style={{ backgroundColor: "rgba(196,122,128,0.1)", color: BLUSH, borderColor: "rgba(196,122,128,0.25)" }}>
      <Shield size={10} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 border"
      style={{ backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }}>
      <User size={10} /> Customer
    </span>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const { data, isLoading } = useCustomers(page, search);

  const customers = data?.users ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#f9f4ef", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: DARK }}>Customers</h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
          {data?.pagination.total ?? 0} registered users
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            style={{ ...INPUT, paddingLeft: 34, height: 40, width: "100%" }}
            onFocus={e => (e.target.style.borderColor = BLUSH)}
            onBlur={e => (e.target.style.borderColor = "rgba(44,35,32,0.15)")} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "white", border: "1px solid rgba(44,35,32,0.08)", boxShadow: "0 2px 8px rgba(44,35,32,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#fdf8f3" }}>
                {["Customer","Email","Role","Joined","Orders"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(44,35,32,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}>
                    <td colSpan={5} className="py-3 px-4">
                      <div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(44,35,32,0.07)" }} />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16" style={{ color: "rgba(44,35,32,0.35)" }}>
                    <Users size={32} className="mx-auto mb-3" style={{ color: "rgba(44,35,32,0.15)" }} />
                    {search ? "No customers match your search" : "No customers yet"}
                  </td>
                </tr>
              ) : customers.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(44,35,32,0.015)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
                        {c.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <p className="font-medium" style={{ color: DARK }}>{c.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5" style={{ color: "rgba(44,35,32,0.6)" }}>
                      <Mail size={12} />
                      <span className="text-sm">{c.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><RoleBadge role={c.role} /></td>
                  <td className="py-3 px-4 text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: DARK }}>
                    {c.orderCount ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid rgba(44,35,32,0.06)" }}>
            <p className="text-xs" style={{ color: "rgba(44,35,32,0.4)" }}>
              Page {page} of {data.pagination.pages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                style={{ border: "1px solid rgba(44,35,32,0.15)", color: DARK, backgroundColor: "white" }}>
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                style={{ border: "1px solid rgba(44,35,32,0.15)", color: DARK, backgroundColor: "white" }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-xs mt-4 text-center" style={{ color: "rgba(44,35,32,0.35)" }}>
        Customer management requires the users admin endpoint on the backend.
      </p>
    </div>
  );
}
