import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
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

// Category admin CRUD
router.post("/categories", authenticate, requireAdmin, wrap(createCategory));
router.put("/categories/:id", authenticate, requireAdmin, wrap(updateCategory));
router.delete("/categories/:id", authenticate, requireAdmin, wrap(deleteCategory));

// Product admin CRUD
router.post("/", authenticate, requireAdmin, wrap(createProduct));
router.put("/:id", authenticate, requireAdmin, wrap(updateProduct));
router.delete("/:id", authenticate, requireAdmin, wrap(deleteProduct));

export default router;
