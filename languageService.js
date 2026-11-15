// backend/services/languageService.js
// ─────────────────────────────────────────────────────────────
// Detects language using Google Cloud Translation API
// Falls back to franc (offline library) if Google is unavailable
// ─────────────────────────────────────────────────────────────

const { Translate } = require("@google-cloud/translate").v2;
let translate;

try {
  translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY,
  });
} catch {
  translate = null;
}

async function detectLanguage(text) {
  if (!text || text.trim().length < 3) return "en";

  // ── Google Cloud detection (most accurate) ──────────────
  if (translate && process.env.GOOGLE_TRANSLATE_API_KEY) {
    try {
      const [detections] = await translate.detect(text);
      const detected = Array.isArray(detections) ? detections[0] : detections;
      if (detected?.language) return detected.language;
    } catch (err) {
      console.warn("[languageService] Google detect failed:", err.message);
    }
  }

  // ── Fallback: franc (offline, no API key needed) ─────────
  try {
    const { franc } = await import("franc");
    const code = franc(text, { minLength: 3 });
    // franc returns ISO 639-3, convert common ones to ISO 639-1
    const francToISO = {
      hin: "hi", tel: "te", tam: "ta", kan: "kn", mal: "ml",
      mar: "mr", ben: "bn", guj: "gu", pan: "pa", urd: "ur",
      eng: "en", ara: "ar", zho: "zh", jpn: "ja", kor: "ko",
      spa: "es", fra: "fr", deu: "de", rus: "ru", por: "pt",
      ita: "it", tur: "tr", vie: "vi", tha: "th", ind: "id",
    };
    return francToISO[code] || "en";
  } catch {
    return "en";
  }
}

module.exports = { detectLanguage };
