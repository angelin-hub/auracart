import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
} from "../controllers/products.controller";

const router = Router();
const wrap = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Public
router.get("/", wrap(getProducts));
router.get("/featured", wrap(getFeaturedProducts));
router.get("/categories", wrap(getCategories));
router.get("/admin/all", authenticate, requireAdmin, wrap(getAdminProducts));
router.get("/:slug", wrap(getProductBySlug));

// Admin
router.post("/", authenticate, requireAdmin, wrap(createProduct));
router.put("/:id", authenticate, requireAdmin, wrap(updateProduct));
router.delete("/:id", authenticate, requireAdmin, wrap(deleteProduct));

export default router;
