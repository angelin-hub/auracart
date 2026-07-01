import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useProducts, useCategories } from "@/hooks/useProducts";
import ProductCard from "@/components/ui/ProductCard";
import type { ProductFilters } from "@/types";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc",  label: "Oldest First" },
  { value: "price:asc",      label: "Price: Low to High" },
  { value: "price:desc",     label: "Price: High to Low" },
  { value: "rating:desc",    label: "Highest Rated" },
  { value: "name:asc",       label: "Name: A-Z" },
];

const N = "#222E50"; // navy
const G = "#FCCB06"; // gold
const BG = "#EDF7F6"; // mint bg

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: categories } = useCategories();

  const getFilters = (): ProductFilters => ({
    category:  searchParams.get("category")  || undefined,
    search:    searchParams.get("search")    || undefined,
    minPrice:  searchParams.get("minPrice")  ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice:  searchParams.get("maxPrice")  ? Number(searchParams.get("maxPrice")) : undefined,
    sort:      (searchParams.get("sort")  as any) || "createdAt",
    order:     (searchParams.get("order") as any) || "desc",
    featured:  searchParams.get("featured") === "true" || undefined,
    page:      Number(searchParams.get("page")) || 1,
    limit:     12,
  });

  const filters = getFilters();
  const { data, isLoading } = useProducts(filters);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSort = (value: string) => {
    const [sort, order] = value.split(":");
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    params.set("order", order);
    params.set("page", "1");
    setSearchParams(params);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentSort = `${filters.sort || "createdAt"}:${filters.order || "desc"}`;
  const activeFiltersCount = [filters.category, filters.search, filters.minPrice, filters.maxPrice, filters.featured].filter(Boolean).length;

  const inputStyle = {
    background: "white",
    border: "1.5px solid rgba(34,46,80,0.15)",
    color: N,
    borderRadius: "0.75rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-1" style={{ color: N }}>
            {filters.featured ? "Featured Collection"
              : filters.category ? filters.category.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
              : "All Products"}
          </h1>
          {data && (
            <p className="text-sm" style={{ color: "rgba(34,46,80,0.45)" }}>
              {data.pagination.total.toLocaleString("en-IN")} products found
            </p>
          )}
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(34,46,80,0.35)" }} />
            <input type="text" placeholder="Search products..."
              value={filters.search || ""}
              onChange={(e) => setFilter("search", e.target.value || null)}
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
              style={inputStyle} aria-label="Search" />
          </div>

          {/* Sort */}
          <select value={currentSort} onChange={(e) => handleSort(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm cursor-pointer outline-none"
            style={inputStyle} aria-label="Sort">
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Filter button */}
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filtersOpen || activeFiltersCount > 0 ? "rgba(252,203,6,0.15)" : "white",
              border: `1.5px solid ${filtersOpen || activeFiltersCount > 0 ? G : "rgba(34,46,80,0.15)"}`,
              color: N,
            }}>
            <SlidersHorizontal size={15} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: G, color: N }}>{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              style={{ background: "white", border: "1.5px solid rgba(34,46,80,0.1)", boxShadow: "0 2px 12px rgba(34,46,80,0.06)" }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(34,46,80,0.4)" }}>Category</label>
                <select value={filters.category || ""} onChange={(e) => setFilter("category", e.target.value || null)}
                  className="w-full h-9 px-3 rounded-xl text-sm outline-none" style={inputStyle} aria-label="Category">
                  <option value="">All Categories</option>
                  {categories?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(34,46,80,0.4)" }}>Min Price (₹)</label>
                <input type="number" placeholder="0"
                  value={filters.minPrice || ""}
                  onChange={(e) => setFilter("minPrice", e.target.value || null)}
                  className="w-full h-9 px-3 rounded-xl text-sm outline-none" style={inputStyle}
                  aria-label="Min price" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(34,46,80,0.4)" }}>Max Price (₹)</label>
                <input type="number" placeholder="9999999"
                  value={filters.maxPrice || ""}
                  onChange={(e) => setFilter("maxPrice", e.target.value || null)}
                  className="w-full h-9 px-3 rounded-xl text-sm outline-none" style={inputStyle}
                  aria-label="Max price" />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(34,46,80,0.4)" }}>Featured</label>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input type="checkbox" checked={filters.featured === true}
                    onChange={(e) => setFilter("featured", e.target.checked ? "true" : null)}
                    className="w-4 h-4 rounded" style={{ accentColor: G }} aria-label="Featured only" />
                  <span className="text-sm" style={{ color: N }}>Featured only</span>
                </label>
              </div>
              {activeFiltersCount > 0 && (
                <div className="col-span-full pt-3" style={{ borderTop: "1px solid rgba(34,46,80,0.08)" }}>
                  <button onClick={() => setSearchParams({})}
                    className="flex items-center gap-1.5 text-sm transition-colors"
                    style={{ color: "#dc2626" }}>
                    <X size={14} /> Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white">
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-3 shimmer rounded w-2/3" />
                  <div className="h-5 shimmer rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-semibold mb-2" style={{ color: "rgba(34,46,80,0.3)" }}>No products found</p>
            <p className="text-sm mb-6" style={{ color: "rgba(34,46,80,0.25)" }}>Try adjusting your filters</p>
            <button onClick={() => setSearchParams({})} className="btn-navy px-6 py-2.5 text-sm">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.pages && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage(filters.page! - 1)} disabled={filters.page === 1}
              className="p-2 rounded-xl transition-all disabled:opacity-30"
              style={{ background: "white", border: "1.5px solid rgba(34,46,80,0.15)", color: N }}
              aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(data.pagination.pages, 7) }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setPage(page)}
                className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: filters.page === page ? G : "white",
                  color: filters.page === page ? N : "rgba(34,46,80,0.6)",
                  border: `1.5px solid ${filters.page === page ? G : "rgba(34,46,80,0.15)"}`,
                  fontWeight: filters.page === page ? 700 : 500,
                }}
                aria-label={`Page ${page}`} aria-current={filters.page === page ? "page" : undefined}>
                {page}
              </button>
            ))}
            <button onClick={() => setPage(filters.page! + 1)} disabled={filters.page === data.pagination.pages}
              className="p-2 rounded-xl transition-all disabled:opacity-30"
              style={{ background: "white", border: "1.5px solid rgba(34,46,80,0.15)", color: N }}
              aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
