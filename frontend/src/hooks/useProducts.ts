import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Product, Category, ProductFilters } from "@/types";
import toast from "react-hot-toast";

export const useProducts = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });

  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await api.get(`/products?${params.toString()}`);
      return data.data as { products: Product[]; pagination: any };
    },
  });
};

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data as { product: Product; reviews: any[] };
    },
    enabled: !!slug,
  });

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await api.get("/products/featured");
      return data.data.products as Product[];
    },
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/products/categories");
      return data.data.categories as Category[];
    },
  });

export const useAdminProducts = (filters: { page?: number; search?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.search) params.set("search", filters.search);

  return useQuery({
    queryKey: ["admin-products", filters],
    queryFn: async () => {
      const { data } = await api.get(`/products/admin/all?${params.toString()}`);
      return data.data as { products: Product[]; pagination: any };
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data } = await api.post("/products", product);
      return data.data.product as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created successfully");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create product"),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data } = await api.put(`/products/${id}`, updates);
      return data.data.product as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product updated successfully");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update product"),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete product"),
  });
};
