import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller";

const router = Router();

// Async wrapper to forward errors to errorHandler
const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getMe));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.put("/change-password", authenticate, asyncHandler(changePassword));

export default router;
