import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
} from "../controllers/orders.controller";

const router = Router();

router.use(authenticate);

// User routes
router.post("/", createOrder);
router.get("/my-orders", getUserOrders);
router.get("/:id", getOrderById);

// Admin routes
router.get("/admin/all", requireAdmin, getAllOrders);
router.get("/admin/stats", requireAdmin, getAdminStats);
router.put("/admin/:id/status", requireAdmin, updateOrderStatus);

export default router;
