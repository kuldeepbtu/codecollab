import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodeCollab Backend is Running 🚀",
  });
});
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/github", githubRoutes);

export default app;