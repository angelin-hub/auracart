// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: string;
  comparePrice?: string;
  sku?: string;
  stock: number;
  categoryId?: string;
  images: string[];
  tags: string[];
  attributes?: Record<string, string>;
  rating?: string;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  brand?: string;
  weight?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  isVerified: boolean;
  createdAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  quantity: number;
  addedAt: string;
  product: Pick<Product, "id" | "name" | "slug" | "price" | "comparePrice" | "images" | "stock" | "brand">;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  addedAt: string;
  product: Pick<Product, "id" | "name" | "slug" | "price" | "comparePrice" | "images" | "rating" | "stock" | "brand">;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: string;
  quantity: number;
  total: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
  shippingAddress: ShippingAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
  };
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "createdAt" | "price" | "rating" | "name";
  order?: "asc" | "desc";
  featured?: boolean;
  brand?: string;
  page?: number;
  limit?: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}
