import { create } from "zustand";
import type { Cart } from "@/types";

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  setCart: (cart: Cart) => void;
  setOpen: (open: boolean) => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,

  setCart: (cart) => set({ cart }),

  setOpen: (isOpen) => set({ isOpen }),

  getItemCount: () =>
    get().cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0,
}));
