import { useState } from "react";
import { Plus, Edit2, Trash2, X, Loader2, Tag } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useProducts";
import type { Category } from "@/types";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";

const INPUT: React.CSSProperties = {
  backgroundColor: "white",
  border: "1.5px solid rgba(44,35,32,0.15)",
  borderRadius: 12,
  padding: "10px 14px",
  color: DARK,
  outline: "none",
  width: "100%",
  fontSize: 14,
};

const CARD: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid rgba(44,35,32,0.08)",
  boxShadow: "0 2px 8px rgba(44,35,32,0.06)",
  borderRadius: 16,
};

function blank(): Partial<Category> {
  return { name: "", slug: "", description: "" };
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const createCat  = useCreateCategory();
  const updateCat  = useUpdateCategory();
  const deleteCat  = useDeleteCategory();

  const [panelOpen, setPanelOpen]   = useState(false);
  const [mode, setMode]             = useState<"create" | "edit">("create");
  const [form, setForm]             = useState<Partial<Category>>(blank());
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const isSaving = createCat.isPending || updateCat.isPending;

  const openCreate = () => {
    setForm(blank()); setErrors({});
    setMode("create"); setPanelOpen(true);
  };
  const openEdit = (cat: Category) => {
    setForm({ ...cat }); setErrors({});
    setMode("edit"); setPanelOpen(true);
  };

  const set = (key: keyof Category, value: string) => {
    setForm(prev => {
      const next: Partial<Category> = { ...prev, [key]: value };
      if (key === "name" && mode === "create") next.slug = slugify(value);
      return next;
    });
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.slug?.trim()) e.slug = "Slug is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (mode === "create") await createCat.mutateAsync(form);
    else await updateCat.mutateAsync({ id: form.id!, ...form } as Category & { id: string });
    setPanelOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirmId === id) { deleteCat.mutate(id); setConfirmId(null); }
    else { setConfirmId(id); setTimeout(() => setConfirmId(null), 3000); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#f9f4ef", minHeight: "100%" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: DARK }}>Categories</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(44,35,32,0.5)" }}>
            {categories?.length ?? 0} categories
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: DARK, color: "white" }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl animate-pulse h-28"
              style={{ backgroundColor: "rgba(44,35,32,0.07)" }} />
          ))}
        </div>
      ) : !categories?.length ? (
        <div className="text-center py-24">
          <Tag size={40} className="mx-auto mb-4" style={{ color: "rgba(44,35,32,0.15)" }} />
          <p style={{ color: "rgba(44,35,32,0.4)" }}>No categories yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} style={CARD} className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(196,122,128,0.1)" }}>
                  <Tag size={18} style={{ color: BLUSH }} />
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "rgba(44,35,32,0.4)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = DARK)}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(44,35,32,0.4)")}
                    aria-label="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg transition-colors text-xs font-medium"
                    style={{ color: confirmId === cat.id ? "#ef4444" : "rgba(44,35,32,0.4)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = confirmId === cat.id ? "#ef4444" : "rgba(44,35,32,0.4)")}
                    aria-label="Delete">
                    {confirmId === cat.id ? <span className="text-[11px] font-semibold">Confirm?</span> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <p className="font-semibold" style={{ color: DARK }}>{cat.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(44,35,32,0.4)" }}>
                  /{cat.slug}
                </p>
                {cat.description && (
                  <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "rgba(44,35,32,0.55)" }}>
                    {cat.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setPanelOpen(false)} aria-hidden="true" />
      )}
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(460px, 100vw)", backgroundColor: "white",
          boxShadow: "-8px 0 32px rgba(44,35,32,0.12)",
          transform: panelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(44,35,32,0.08)" }}>
          <h2 className="font-semibold text-lg" style={{ color: DARK }}>
            {mode === "create" ? "New Category" : "Edit Category"}
          </h2>
          <button onClick={() => setPanelOpen(false)} className="p-2 rounded-xl transition-colors"
            style={{ color: "rgba(44,35,32,0.4)" }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(44,35,32,0.55)" }}>
              Name *
            </label>
            <input value={form.name ?? ""} onChange={e => set("name", e.target.value)}
              placeholder="e.g. Dresses" style={{ ...INPUT, ...(errors.name ? { borderColor: "#ef4444" } : {}) }}
              onFocus={e => (e.target.style.borderColor = BLUSH)}
              onBlur={e => (e.target.style.borderColor = errors.name ? "#ef4444" : "rgba(44,35,32,0.15)")} />
            {errors.name && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(44,35,32,0.55)" }}>
              Slug *
            </label>
            <input value={form.slug ?? ""} onChange={e => set("slug", slugify(e.target.value))}
              placeholder="e.g. dresses" style={{ ...INPUT, fontFamily: "monospace", ...(errors.slug ? { borderColor: "#ef4444" } : {}) }}
              onFocus={e => (e.target.style.borderColor = BLUSH)}
              onBlur={e => (e.target.style.borderColor = errors.slug ? "#ef4444" : "rgba(44,35,32,0.15)")} />
            {errors.slug && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.slug}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(44,35,32,0.55)" }}>
              Description
            </label>
            <textarea rows={3} value={form.description ?? ""} onChange={e => set("description", e.target.value)}
              placeholder="Short description of this category..."
              style={{ ...INPUT, resize: "vertical" }}
              onFocus={e => ((e.target as HTMLTextAreaElement).style.borderColor = BLUSH)}
              onBlur={e => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(44,35,32,0.15)")} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(44,35,32,0.55)" }}>
              Image URL
            </label>
            <input value={form.imageUrl ?? ""} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://example.com/category.jpg" style={INPUT}
              onFocus={e => (e.target.style.borderColor = BLUSH)}
              onBlur={e => (e.target.style.borderColor = "rgba(44,35,32,0.15)")} />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(44,35,32,0.08)" }}>
          <button onClick={() => setPanelOpen(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ border: "1.5px solid rgba(44,35,32,0.2)", color: DARK, backgroundColor: "white" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: DARK, color: "white" }}>
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : mode === "create" ? "Save" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
