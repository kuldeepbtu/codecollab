import express from "express";
import {
  signupController,
  loginController,
  getMeController,
  googleLoginController,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/google", googleLoginController);
router.get("/me", protect, getMeController);

export default router;