// backend/routes/analyze.js
const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const router  = express.Router();

const { analyzeTextForScam }  = require("../services/scamDetector");
const { transcribeAudio }     = require("../services/whisperService");
const { detectLanguage }      = require("../services/languageService");

// Multer — store audio files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename:    (req, file, cb) => cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /mp3|wav|m4a|ogg|flac|webm|mp4/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

// ── POST /api/analyze/text ─────────────────────────────────
router.post("/text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 3)
      return res.status(400).json({ error: "Text is required" });

    const detectedLang = await detectLanguage(text);
    const result       = await analyzeTextForScam(text, detectedLang);
    return res.json({ ...result, detectedLanguage: detectedLang });

  } catch (err) {
    console.error("[analyze/text]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/analyze/audio ────────────────────────────────
router.post("/audio", upload.single("audio"), async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: "Audio file is required" });

    // 1. Transcribe with Whisper
    const { transcript, detectedLanguage, detectedLanguageName } =
      await transcribeAudio(filePath);

    // 2. Analyze transcript
    const result = await analyzeTextForScam(transcript, detectedLanguage);

    return res.json({
      transcript,
      detectedLanguage,
      detectedLanguageName,
      ...result,
    });

  } catch (err) {
    console.error("[analyze/audio]", err);
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up temp file
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

module.exports = router;
