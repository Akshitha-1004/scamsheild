// backend/routes/translate.js
const express = require("express");
const router  = express.Router();

const { translateText }      = require("../services/translateService");
const { analyzeTextForScam } = require("../services/scamDetector");
const { detectLanguage }     = require("../services/languageService");

// ── POST /api/translate ────────────────────────────────────
// Body: { text: string, targetLang: "en"|"hi"|"te"|... }
router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang)
      return res.status(400).json({ error: "text and targetLang are required" });

    // 1. Detect source language
    const fromLang = await detectLanguage(text);

    // 2. Translate
    const translated = await translateText(text, fromLang, targetLang);

    // 3. Scam-check the translated text (always in a known language → more accurate)
    const scamResult = await analyzeTextForScam(translated, targetLang);

    return res.json({
      original:   text,
      translated,
      fromLang,
      toLang:     targetLang,
      ...scamResult,
    });

  } catch (err) {
    console.error("[translate]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
