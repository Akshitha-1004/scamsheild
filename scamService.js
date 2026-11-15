// frontend/src/services/scamService.js
// Calls your Node.js/Express backend

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Text / Message Analysis ─────────────────────────────────
export async function analyzeText(text) {
  const res = await fetch(`${API_BASE}/analyze/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
  /*
  Returns:
  {
    verdict: "SCAM" | "SUSPICIOUS" | "SAFE",
    riskScore: 0-100,
    confidence: 0-100,
    matches: [{ word, level: "critical"|"high"|"medium"|"low" }],
    explanation: "...",
    detectedLanguage: "en" | "hi" | ...
  }
  */
}

// ─── Audio Upload & Transcription ────────────────────────────
export async function analyzeAudio(audioBlob, filename = "recording.wav") {
  const formData = new FormData();
  formData.append("audio", audioBlob, filename);

  const res = await fetch(`${API_BASE}/analyze/audio`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Audio analysis failed");
  return res.json();
  /*
  Returns:
  {
    transcript: "...",
    detectedLanguage: "hi",
    detectedLanguageName: "Hindi",
    verdict: "SCAM",
    riskScore: 85,
    confidence: 92,
    matches: [...],
    explanation: "..."
  }
  */
}

// ─── Translation ──────────────────────────────────────────────
export async function translateAndAnalyze(text, targetLang) {
  const res = await fetch(`${API_BASE}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  if (!res.ok) throw new Error("Translation failed");
  return res.json();
  /*
  Returns:
  {
    original: "...",
    translated: "...",
    fromLang: "hi",
    toLang: "en",
    verdict: "SCAM",
    riskScore: 80
  }
  */
}

// ─── AI Chatbot ───────────────────────────────────────────────
export async function chatWithBot(messages) {
  // messages = [{ role: "user"|"assistant", content: "..." }]
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json(); // { reply: "..." }
}
