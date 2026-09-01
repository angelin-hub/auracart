import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Package,
  Star,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
} from "@/hooks/useProducts";
import type { Product } from "@/types";
import { toINR } from "@/lib/currency";

// ── Design tokens ──────────────────────────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: "white",
  border: "1.5px solid rgba(44,35,32,0.15)",
  borderRadius: 12,
  padding: "10px 16px",
  color: "#2c2320",
  outline: "none",
  width: "100%",
  fontSize: 14,
};

const SECTION_HEADER: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(44,35,32,0.4)",
  marginBottom: 12,
  marginTop: 4,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function stockBadge(stock: number) {
  if (stock === 0)
    return { label: "Out of Stock", bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" };
  if (stock < 10)
    return { label: "Low Stock", bg: "#fffbeb", text: "#b45309", border: "#fde68a" };
  return { label: "In Stock", bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" };
}

function StockBadge({ stock }: { stock: number }) {
  const b = stockBadge(stock);
  return (
    <span
      className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 border"
      style={{ backgroundColor: b.bg, color: b.text, borderColor: b.border }}
    >
      {b.label}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 border"
      style={
        active
          ? { backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }
          : { backgroundColor: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "rgba(44,35,32,0.07)" }}
    />
  );
}

// ── Input component ───────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
function FormInput({ label, error, ...props }: InputProps) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "rgba(44,35,32,0.55)" }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          ...INPUT_STYLE,
          ...(error ? { borderColor: "#ef4444" } : {}),
        }}
        onFocus={(e) => {
          if (!error)
            (e.target as HTMLInputElement).style.borderColor = "#c47a80";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          if (!error)
            (e.target as HTMLInputElement).style.borderColor =
              "rgba(44,35,32,0.15)";
          props.onBlur?.(e);
        }}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Blank product ─────────────────────────────────────────────────────────────
function blankProduct(): Partial<Product> {
  return {
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    comparePrice: "",
    sku: "",
    brand: "",
    stock: 0,
    categoryId: "",
    images: [],
    tags: [],
    isFeatured: false,
    isActive: true,
    weight: "",
    attributes: { sizes: "", colors: "" },
  };
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

// ── Slide-in Product Form Panel ───────────────────────────────────────────────
interface PanelProps {
  open: boolean;
  mode: "create" | "edit";
  product: Partial<Product>;
  onChange: (key: keyof Product, value: unknown) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  errors: Record<string, string>;
}

function ProductPanel({
  open,
  mode,
  product,
  onChange,
  onClose,
  onSave,
  saving,
  errors,
}: PanelProps) {
  const { data: categories } = useCategories();

  const selectedSizes = (product.attributes?.sizes ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleSize = (size: string) => {
    const current = selectedSizes;
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    onChange("attributes", { ...(product.attributes ?? {}), sizes: next.join(",") });
  };

  const imageUrls = (product.images ?? []).join("\n");

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
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
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(44,35,32,0.08)" }}
        >
          <h2
            className="font-semibold text-lg"
            style={{ color: "#2c2320" }}
          >
            {mode === "create" ? "Add Product" : "Edit Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: "rgba(44,35,32,0.4)" }}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Basic Info */}
          <div>
            <p style={SECTION_HEADER}>Basic Info</p>
            <div className="space-y-4">
              <FormInput
                label="Product Name *"
                placeholder="e.g. Silk Wrap Dress"
                value={product.name ?? ""}
                onChange={(e) => onChange("name", e.target.value)}
                error={errors.name}
              />
              <FormInput
                label="Short Description"
                placeholder="Brief one-liner"
                value={product.shortDescription ?? ""}
                onChange={(e) => onChange("shortDescription", e.target.value)}
              />
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "rgba(44,35,32,0.55)" }}
                >
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Full product description..."
                  value={product.description ?? ""}
                  onChange={(e) => onChange("description", e.target.value)}
                  style={{ ...INPUT_STYLE, resize: "vertical" }}
                  onFocus={(e) =>
                    ((e.target as HTMLTextAreaElement).style.borderColor =
                      "#c47a80")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLTextAreaElement).style.borderColor =
                      "rgba(44,35,32,0.15)")
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Brand"
                  placeholder="Brand name"
                  value={product.brand ?? ""}
                  onChange={(e) => onChange("brand", e.target.value)}
                />
                <FormInput
                  label="SKU"
                  placeholder="SKU-001"
                  value={product.sku ?? ""}
                  onChange={(e) => onChange("sku", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p style={SECTION_HEADER}>Pricing</p>
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Price (₹) *"
                type="number"
                placeholder="0.00"
                value={product.price ?? ""}
                onChange={(e) => onChange("price", e.target.value)}
                error={errors.price}
              />
              <FormInput
                label="Compare / MRP"
                type="number"
                placeholder="0.00"
                value={product.comparePrice ?? ""}
                onChange={(e) => onChange("comparePrice", e.target.value)}
              />
              <FormInput
                label="Cost Price"
                type="number"
                placeholder="0.00"
                value={(product.attributes?.costPrice as string) ?? ""}
                onChange={(e) =>
                  onChange("attributes", {
                    ...(product.attributes ?? {}),
                    costPrice: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div>
            <p style={SECTION_HEADER}>Category & Tags</p>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "rgba(44,35,32,0.55)" }}
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    value={product.categoryId ?? ""}
                    onChange={(e) => onChange("categoryId", e.target.value)}
                    style={{ ...INPUT_STYLE, appearance: "none", paddingRight: 36 }}
                    onFocus={(e) =>
                      ((e.target as HTMLSelectElement).style.borderColor =
                        "#c47a80")
                    }
                    onBlur={(e) =>
                      ((e.target as HTMLSelectElement).style.borderColor =
                        "rgba(44,35,32,0.15)")
                    }
                  >
                    <option value="">— Select category —</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "rgba(44,35,32,0.4)" }}
                  />
                </div>
              </div>
              <FormInput
                label="Tags (comma-separated)"
                placeholder="luxury, ethnic, summer"
                value={(product.tags ?? []).join(", ")}
                onChange={(e) =>
                  onChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          {/* Inventory */}
          <div>
            <p style={SECTION_HEADER}>Inventory</p>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Stock Quantity *"
                type="number"
                placeholder="0"
                value={String(product.stock ?? 0)}
                onChange={(e) =>
                  onChange("stock", parseInt(e.target.value, 10) || 0)
                }
              />
              <FormInput
                label="Weight (kg)"
                placeholder="0.5"
                value={product.weight ?? ""}
                onChange={(e) => onChange("weight", e.target.value)}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <p style={SECTION_HEADER}>Images</p>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(44,35,32,0.55)" }}
              >
                Image URLs (one per line)
              </label>
              <textarea
                rows={4}
                placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
                value={imageUrls}
                onChange={(e) =>
                  onChange(
                    "images",
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                onFocus={(e) =>
                  ((e.target as HTMLTextAreaElement).style.borderColor =
                    "#c47a80")
                }
                onBlur={(e) =>
                  ((e.target as HTMLTextAreaElement).style.borderColor =
                    "rgba(44,35,32,0.15)")
                }
              />
            </div>
            {/* Preview thumbnails */}
            {(product.images ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(product.images ?? []).slice(0, 6).map((url, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-16 rounded-lg overflow-hidden"
                    style={{ border: "1px solid rgba(44,35,32,0.1)" }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div>
            <p style={SECTION_HEADER}>Sizes</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => {
                const active = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={
                      active
                        ? {
                            backgroundColor: "#2c2320",
                            color: "white",
                            border: "1.5px solid #2c2320",
                          }
                        : {
                            backgroundColor: "white",
                            color: "#2c2320",
                            border: "1.5px solid rgba(44,35,32,0.2)",
                          }
                    }
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p style={SECTION_HEADER}>Colors</p>
            <FormInput
              label="Colors (comma-separated)"
              placeholder="Red, Blue, Black"
              value={product.attributes?.colors ?? ""}
              onChange={(e) =>
                onChange("attributes", {
                  ...(product.attributes ?? {}),
                  colors: e.target.value,
                })
              }
            />
          </div>

          {/* Settings */}
          <div>
            <p style={SECTION_HEADER}>Settings</p>
            <div className="space-y-3">
              <label
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: product.isActive
                      ? "#22c55e"
                      : "rgba(44,35,32,0.15)",
                  }}
                  onClick={() => onChange("isActive", !product.isActive)}
                  role="switch"
                  aria-checked={product.isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter")
                      onChange("isActive", !product.isActive);
                  }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{
                      left: product.isActive ? "calc(100% - 18px)" : "2px",
                    }}
                  />
                </div>
                <span className="text-sm" style={{ color: "#2c2320" }}>
                  Active (visible on store)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isFeatured ?? false}
                  onChange={(e) => onChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#c47a80" }}
                />
                <span className="text-sm" style={{ color: "#2c2320" }}>
                  Featured (show on homepage)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              border: "1.5px solid rgba(44,35,32,0.2)",
              color: "#2c2320",
              backgroundColor: "white",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#2c2320", color: "white" }}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : mode === "create" ? (
              "Save Product"
            ) : (
              "Update Product"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("create");
  const [editProduct, setEditProduct] = useState<Partial<Product>>(blankProduct());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categoriesData } = useCategories();
  const { data, isLoading } = useAdminProducts({
    page,
    search: debouncedSearch,
  });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditProduct(blankProduct());
    setErrors({});
    setPanelMode("create");
    setPanelOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct({ ...p });
    setErrors({});
    setPanelMode("edit");
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const handleChange = (key: keyof Product, value: unknown) => {
    setEditProduct((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!editProduct.name?.trim()) e.name = "Product name is required";
    if (!editProduct.price || parseFloat(String(editProduct.price)) <= 0)
      e.price = "Price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (panelMode === "create") {
      await createProduct.mutateAsync(editProduct);
    } else {
      await updateProduct.mutateAsync({
        id: editProduct.id!,
        ...editProduct,
      } as Product & { id: string });
    }
    closePanel();
  };

  const handleDeleteClick = (id: string) => {
    if (confirmDelete === id) {
      deleteProduct.mutate(id);
      setConfirmDelete(null);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    } else {
      setConfirmDelete(id);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  // Filter products client-side by status and category
  const filteredProducts = (data?.products ?? []).filter((p) => {
    if (statusFilter === "active" && !p.isActive) return false;
    if (statusFilter === "inactive" && p.isActive) return false;
    if (statusFilter === "featured" && !p.isFeatured) return false;
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    return true;
  });

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div
      className="p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#f9f4ef", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#2c2320" }}>
            Products
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
            {data?.pagination.total ?? 0} total products
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#2c2320", color: "white" }}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...INPUT_STYLE,
              paddingLeft: 36,
              height: 40,
              fontSize: 14,
            }}
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{
              ...INPUT_STYLE,
              width: "auto",
              paddingLeft: 32,
              paddingRight: 32,
              height: 40,
              appearance: "none",
            }}
          >
            <option value="">All Categories</option>
            {categoriesData?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              ...INPUT_STYLE,
              width: "auto",
              paddingRight: 32,
              height: 40,
              appearance: "none",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(44,35,32,0.35)" }}
          />
        </div>
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
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Status",
                  "Featured",
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
                    <td colSpan={7} className="py-3 px-4">
                      <Skeleton className="h-10" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16"
                    style={{ color: "rgba(44,35,32,0.35)" }}
                  >
                    <Package
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: "rgba(44,35,32,0.15)" }}
                    />
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const catName =
                    categoriesData?.find((c) => c.id === product.categoryId)
                      ?.name ?? "—";
                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: "1px solid rgba(44,35,32,0.06)" }}
                      className="transition-colors"
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          "rgba(44,35,32,0.02)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          "")
                      }
                    >
                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0"
                            style={{
                              backgroundColor: "rgba(44,35,32,0.06)",
                            }}
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
                                  style={{ color: "rgba(44,35,32,0.2)" }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-medium truncate max-w-[160px]"
                              style={{ color: "#2c2320" }}
                            >
                              {product.name}
                            </p>
                            {product.sku && (
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "rgba(44,35,32,0.35)" }}
                              >
                                {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td
                        className="py-3 px-4 text-sm"
                        style={{ color: "rgba(44,35,32,0.6)" }}
                      >
                        {catName}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <p className="font-semibold" style={{ color: "#2c2320" }}>
                          {toINR(product.price)}
                        </p>
                        {product.comparePrice && (
                          <p
                            className="text-xs line-through"
                            style={{ color: "rgba(44,35,32,0.35)" }}
                          >
                            {toINR(product.comparePrice)}
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <StockBadge stock={product.stock} />
                        <p
                          className="text-xs mt-1"
                          style={{ color: "rgba(44,35,32,0.4)" }}
                        >
                          {product.stock} units
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge active={product.isActive} />
                      </td>

                      {/* Featured */}
                      <td className="py-3 px-4">
                        <Star
                          size={16}
                          fill={product.isFeatured ? "#c47a80" : "none"}
                          style={{
                            color: product.isFeatured
                              ? "#c47a80"
                              : "rgba(44,35,32,0.2)",
                          }}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "rgba(44,35,32,0.4)" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = "#2c2320";
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(44,35,32,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = "rgba(44,35,32,0.4)";
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
                            }}
                            aria-label="Edit product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            disabled={deleteProduct.isPending}
                            className="p-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                            style={{
                              color:
                                confirmDelete === product.id
                                  ? "#ef4444"
                                  : "rgba(44,35,32,0.4)",
                              backgroundColor:
                                confirmDelete === product.id
                                  ? "#fef2f2"
                                  : "",
                            }}
                            aria-label={
                              confirmDelete === product.id
                                ? "Confirm delete"
                                : "Delete product"
                            }
                          >
                            {confirmDelete === product.id ? (
                              <span className="text-xs px-1">Confirm?</span>
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
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
            disabled={(data?.products.length ?? 0) < 20}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
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

      {/* Slide-in Panel */}
      <ProductPanel
        open={panelOpen}
        mode={panelMode}
        product={editProduct}
        onChange={handleChange}
        onClose={closePanel}
        onSave={handleSave}
        saving={isSaving}
        errors={errors}
      />
    </div>
  );
}
