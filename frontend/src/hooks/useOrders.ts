import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Order, ShippingAddress } from "@/types";
import toast from "react-hot-toast";

export const useOrders = (page = 1) =>
  useQuery({
    queryKey: ["orders", page],
    queryFn: async () => {
      const { data } = await api.get(`/orders/my-orders?page=${page}`);
      return data.data as { orders: Order[]; pagination: any };
    },
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data.order as Order;
    },
    enabled: !!id,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { shippingAddress: ShippingAddress; notes?: string }) => {
      const { data } = await api.post("/orders", payload);
      return data.data.order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to place order"),
  });
};

// Admin
export const useAdminOrders = (page = 1, status?: string) =>
  useQuery({
    queryKey: ["admin-orders", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("status", status);
      const { data } = await api.get(`/orders/admin/all?${params.toString()}`);
      return data.data as { orders: any[]; pagination: any };
    },
  });

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/orders/admin/stats");
      return data.data as { stats: any; recentOrders: any[] };
    },
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, trackingNumber }: { id: string; status: string; trackingNumber?: string }) => {
      const { data } = await api.put(`/orders/admin/${id}/status`, { status, trackingNumber });
      return data.data.order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update order"),
  });
};
