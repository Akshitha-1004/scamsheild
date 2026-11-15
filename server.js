// backend/server.js
require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const analyzeRoutes   = require("./routes/analyze");
const translateRoutes = require("./routes/translate");
const chatRoutes      = require("./routes/chat");

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

// Temp upload dir
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Routes ──────────────────────────────────────────────────
app.use("/api/analyze",   analyzeRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/chat",      chatRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🛡️  ScamShield backend running on port ${PORT}`));
