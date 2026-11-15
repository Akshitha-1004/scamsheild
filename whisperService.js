// backend/services/whisperService.js
// ─────────────────────────────────────────────────────────────
// Transcribes audio using OpenAI Whisper API
// Supports: MP3, WAV, M4A, FLAC, WebM, OGG, MP4
// Automatically detects language (supports 50+ languages
// including all major Indian regional languages)
// ─────────────────────────────────────────────────────────────

const fs      = require("fs");
const OpenAI  = require("openai");

const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Maps Whisper language codes to human-readable names
const LANG_NAMES = {
  en: "English",      hi: "Hindi",        te: "Telugu",
  ta: "Tamil",        kn: "Kannada",      ml: "Malayalam",
  mr: "Marathi",      bn: "Bengali",      gu: "Gujarati",
  pa: "Punjabi",      ur: "Urdu",         or: "Odia",
  as: "Assamese",     si: "Sinhala",      ne: "Nepali",
  ar: "Arabic",       zh: "Chinese",      ja: "Japanese",
  ko: "Korean",       es: "Spanish",      fr: "French",
  de: "German",       ru: "Russian",      pt: "Portuguese",
  it: "Italian",      tr: "Turkish",      vi: "Vietnamese",
  th: "Thai",         id: "Indonesian",   ms: "Malay",
  fa: "Persian",      nl: "Dutch",        pl: "Polish",
  sw: "Swahili",
};

async function transcribeAudio(filePath) {
  // Verify file exists
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file not found: " + filePath);
  }

  // Check file size (Whisper free tier: 25 MB max)
  const stats = fs.statSync(filePath);
  if (stats.size > 25 * 1024 * 1024) {
    throw new Error("Audio file too large. Maximum size is 25 MB.");
  }

  const response = await openai.audio.transcriptions.create({
    file:             fs.createReadStream(filePath),
    model:            "whisper-1",
    response_format:  "verbose_json", // Get language detection info
    // Do NOT set language= so Whisper auto-detects
  });

  const detectedLanguage     = response.language || "en";
  const detectedLanguageName = LANG_NAMES[detectedLanguage] || detectedLanguage;
  const transcript           = response.text?.trim() || "";

  if (!transcript) {
    throw new Error("No speech detected in audio. Please check your recording.");
  }

  return { transcript, detectedLanguage, detectedLanguageName };
}

module.exports = { transcribeAudio };
