import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller";

const router = Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
