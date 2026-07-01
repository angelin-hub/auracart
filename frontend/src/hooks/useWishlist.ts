import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { WishlistItem } from "@/types";
import toast from "react-hot-toast";

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get("/wishlist");
      return data.data.wishlist as WishlistItem[];
    },
    enabled: isAuthenticated,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.post("/wishlist/toggle", { productId });
      return data as { inWishlist: boolean; message: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(data.message);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update wishlist"),
  });
};
