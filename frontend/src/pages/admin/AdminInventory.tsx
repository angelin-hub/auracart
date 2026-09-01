import { useState } from "react";
import { Search, AlertTriangle, Package, CheckCircle2, ChevronDown } from "lucide-react";
import { useAdminProducts, useUpdateProduct, useCategories } from "@/hooks/useProducts";
import { toINR } from "@/lib/currency";

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

function StockStatus({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-0.5 border"
        style={{ backgroundColor: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" }}>
        <AlertTriangle size={11} /> Out of Stock
      </span>
    );
  if (stock < 10)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-0.5 border"
        style={{ backgroundColor: "#fffbeb", color: "#b45309", borderColor: "#fde68a" }}>
        <AlertTriangle size={11} /> Low — {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-0.5 border"
      style={{ backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }}>
      <CheckCircle2 size={11} /> {stock} in stock
    </span>
  );
}

export default function AdminInventory() {
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [statusFilter, setFilter]   = useState<"all"|"out"|"low"|"ok">("all");
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editQty, setEditQty]       = useState("");

  const { data, isLoading }      = useAdminProducts({ page, search });
  const { data: categories }     = useCategories();
  const updateProduct            = useUpdateProduct();

  const products = (data?.products ?? []).filter(p => {
    if (statusFilter === "out") return p.stock === 0;
    if (statusFilter === "low") return p.stock > 0 && p.stock < 10;
    if (statusFilter === "ok")  return p.stock >= 10;
    return true;
  });

  const handleUpdate = async (id: string) => {
    const qty = parseInt(editQty, 10);
    if (isNaN(qty) || qty < 0) return;
    await updateProduct.mutateAsync({ id, stock: qty } as any);
    setEditingId(null);
    setEditQty("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#f9f4ef", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: DARK }}>Inventory</h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
          Manage stock levels for all products
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Products", value: data?.pagination.total ?? 0,   color: DARK },
          { label: "Out of Stock",   value: (data?.products ?? []).filter(p => p.stock === 0).length,        color: "#ef4444" },
          { label: "Low Stock",      value: (data?.products ?? []).filter(p => p.stock > 0 && p.stock < 10).length, color: "#f59e0b" },
          { label: "Well Stocked",   value: (data?.products ?? []).filter(p => p.stock >= 10).length,        color: "#22c55e" },
        ].map(card => (
          <div key={card.label}
            className="rounded-2xl p-4"
            style={{ backgroundColor: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            style={{ ...INPUT, paddingLeft: 34, height: 40, width: "100%" }}
            onFocus={e => (e.target.style.borderColor = BLUSH)}
            onBlur={e => (e.target.style.borderColor = "rgba(44,35,32,0.15)")} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setFilter(e.target.value as any)}
            style={{ ...INPUT, height: 40, paddingRight: 32, appearance: "none" }}
            onFocus={e => (e.target.style.borderColor = BLUSH)}
            onBlur={e => (e.target.style.borderColor = "rgba(44,35,32,0.15)")}>
            <option value="all">All Stock</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock (&lt;10)</option>
            <option value="ok">Well Stocked</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "white", border: "1px solid rgba(44,35,32,0.08)", boxShadow: "0 2px 8px rgba(44,35,32,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#fdf8f3" }}>
                {["Product","Category","Price","Stock Status","Update Stock"].map(h => (
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16" style={{ color: "rgba(44,35,32,0.35)" }}>
                    <Package size={32} className="mx-auto mb-3" style={{ color: "rgba(44,35,32,0.15)" }} />
                    No products match this filter
                  </td>
                </tr>
              ) : products.map(p => {
                const catName = categories?.find(c => c.id === p.categoryId)?.name ?? "—";
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(44,35,32,0.015)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: "#f0e8e0" }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <Package size={13} style={{ color: "rgba(44,35,32,0.2)" }} />
                              </div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[180px]" style={{ color: DARK }}>{p.name}</p>
                          {p.sku && <p className="text-xs" style={{ color: "rgba(44,35,32,0.4)" }}>{p.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: "rgba(44,35,32,0.6)" }}>{catName}</td>
                    <td className="py-3 px-4 font-medium" style={{ color: DARK }}>{toINR(p.price)}</td>
                    <td className="py-3 px-4"><StockStatus stock={p.stock} /></td>
                    {/* Inline edit */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input type="number" min={0} value={editQty}
                            onChange={e => setEditQty(e.target.value)}
                            style={{ ...INPUT, width: 80, height: 34, padding: "4px 10px" }}
                            autoFocus
                            onFocus={e => (e.target.style.borderColor = BLUSH)}
                            onBlur={e => (e.target.style.borderColor = "rgba(44,35,32,0.15)")}
                            onKeyDown={e => { if (e.key === "Enter") handleUpdate(p.id); if (e.key === "Escape") setEditingId(null); }}
                            aria-label="New stock quantity" />
                          <button onClick={() => handleUpdate(p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: DARK }}>
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="px-2 py-1.5 rounded-lg text-xs transition-colors"
                            style={{ color: "rgba(44,35,32,0.45)" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(p.id); setEditQty(String(p.stock)); }}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: BLUSH, backgroundColor: "rgba(196,122,128,0.08)", border: "1px solid rgba(196,122,128,0.2)" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(196,122,128,0.15)")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(196,122,128,0.08)")}>
                          Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors"
                style={{ border: "1px solid rgba(44,35,32,0.15)", color: DARK, backgroundColor: "white" }}>
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors"
                style={{ border: "1px solid rgba(44,35,32,0.15)", color: DARK, backgroundColor: "white" }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
