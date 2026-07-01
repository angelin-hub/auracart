import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, X, Loader2, Package } from "lucide-react";
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import type { Product } from "@/types";
import { toINR } from "@/lib/currency";

const EMPTY: Partial<Product> = {
  name: "", description: "", shortDescription: "", price: "0",
  comparePrice: "", stock: 0, brand: "", images: [], tags: [],
  isFeatured: false, isActive: true,
};

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; mode: "create" | "edit"; product: Partial<Product> }>({
    open: false, mode: "create", product: EMPTY,
  });

  const { data, isLoading } = useAdminProducts({ page, search: debouncedSearch });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const openCreate = () => setModal({ open: true, mode: "create", product: { ...EMPTY } });
  const openEdit = (p: Product) => setModal({ open: true, mode: "edit", product: { ...p } });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const setField = (key: keyof Product, value: any) =>
    setModal((m) => ({ ...m, product: { ...m.product, [key]: value } }));

  const handleSave = async () => {
    if (!modal.product.name || !modal.product.price) return;
    if (modal.mode === "create") {
      await createProduct.mutateAsync(modal.product);
    } else {
      await updateProduct.mutateAsync({ id: modal.product.id!, ...modal.product } as any);
    }
    close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct.mutateAsync(id);
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Products</h1>
              <p className="text-white/40 text-sm mt-1">
                {data?.pagination.total ?? 0} total products
              </p>
            </div>
            <button onClick={openCreate} className="btn-gold flex items-center gap-2 py-2.5 px-5 rounded-xl font-semibold">
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-luxury pl-9 text-sm h-10"
            aria-label="Search products"
          />
        </div>

        {/* Table */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider hidden sm:table-cell">Brand</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="text-left px-5 py-3.5 text-xs text-white/30 font-semibold uppercase tracking-wider hidden md:table-cell">Status</th>
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
                ) : data?.products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-white/30">
                      <Package size={32} className="mx-auto mb-3 text-white/10" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  data?.products.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/3 hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={13} className="text-white/20" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white/90 truncate max-w-[180px]">{product.name}</p>
                            {product.sku && <p className="text-[11px] text-white/25">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-white/40 hidden sm:table-cell">{product.brand || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white">{toINR(product.price)}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`text-sm ${product.stock === 0 ? "text-red-400" : product.stock < 10 ? "text-yellow-400" : "text-white/60"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`badge ${product.isActive ? "badge-aura" : "bg-white/5 text-white/30 border border-white/10"}`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteProduct.isPending}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
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
            <button onClick={() => setPage((p) => p + 1)} disabled={data.products.length < 20} className="btn-outline px-4 py-2 text-sm disabled:opacity-30">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={close} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 glass-card rounded-3xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="font-semibold text-white">
                  {modal.mode === "create" ? "Add Product" : "Edit Product"}
                </h2>
                <button onClick={close} className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5" aria-label="Close modal">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {[
                  { label: "Name *", key: "name" as const, type: "text", placeholder: "Product name" },
                  { label: "Brand", key: "brand" as const, type: "text", placeholder: "Brand name" },
                  { label: "Short Description", key: "shortDescription" as const, type: "text", placeholder: "Brief summary" },
                  { label: "Price *", key: "price" as const, type: "number", placeholder: "0.00" },
                  { label: "Compare Price", key: "comparePrice" as const, type: "number", placeholder: "0.00" },
                  { label: "Stock *", key: "stock" as const, type: "number", placeholder: "0" },
                  { label: "SKU", key: "sku" as const, type: "text", placeholder: "SKU-001" },
                  { label: "Images (comma-separated URLs)", key: "images" as const, type: "text", placeholder: "https://..." },
                  { label: "Tags (comma-separated)", key: "tags" as const, type: "text", placeholder: "luxury, fashion" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-white/40 mb-1.5">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={
                        key === "images" || key === "tags"
                          ? (modal.product[key] as string[] | undefined)?.join(", ") ?? ""
                          : (modal.product[key] as string | number | undefined) ?? ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (key === "images" || key === "tags") {
                          setField(key, v.split(",").map((s) => s.trim()).filter(Boolean));
                        } else if (type === "number") {
                          setField(key, key === "stock" ? parseInt(v) || 0 : v);
                        } else {
                          setField(key, v);
                        }
                      }}
                      className="input-luxury text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Full product description"
                    value={modal.product.description ?? ""}
                    onChange={(e) => setField("description", e.target.value)}
                    className="input-luxury text-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={modal.product.isActive ?? true}
                      onChange={(e) => setField("isActive", e.target.checked)}
                      className="w-4 h-4 accent-aura-400" aria-label="Active" />
                    <span className="text-sm text-white/60">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={modal.product.isFeatured ?? false}
                      onChange={(e) => setField("isFeatured", e.target.checked)}
                      className="w-4 h-4 accent-gold-400" aria-label="Featured" />
                    <span className="text-sm text-white/60">Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-white/5">
                <button onClick={close} className="btn-outline flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !modal.product.name || !modal.product.price}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : modal.mode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
