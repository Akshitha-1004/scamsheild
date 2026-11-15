// backend/services/translateService.js
// ─────────────────────────────────────────────────────────────
// Translates text using Google Cloud Translation API
// Supports all 30+ languages listed in the frontend
// ─────────────────────────────────────────────────────────────

const { Translate } = require("@google-cloud/translate").v2;

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

async function translateText(text, fromLang, targetLang) {
  if (!text || !targetLang) throw new Error("text and targetLang are required");

  // Skip translation if same language
  if (fromLang === targetLang || fromLang === "auto") {
    // Google handles auto-detect when source is omitted
  }

  const options = { to: targetLang };
  if (fromLang && fromLang !== "auto") options.from = fromLang;

  const [translated] = await translate.translate(text, options);
  return typeof translated === "string" ? translated : translated[0];
}

module.exports = { translateText };
