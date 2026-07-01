import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller";

const router = Router();
const wrap = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);

router.get("/", wrap(getCart));
router.post("/", wrap(addToCart));
router.put("/:itemId", wrap(updateCartItem));
router.delete("/clear", wrap(clearCart));
router.delete("/:itemId", wrap(removeFromCart));

export default router;
