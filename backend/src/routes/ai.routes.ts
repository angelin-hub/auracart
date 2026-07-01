import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { chat, getProductSuggestions } from "../controllers/ai.controller";

const router = Router();

router.get("/suggestions", getProductSuggestions);
router.post("/chat", authenticate, chat);

export default router;
