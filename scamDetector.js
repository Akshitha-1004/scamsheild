// backend/services/scamDetector.js
// ─────────────────────────────────────────────────────────────
// Primary scam detection engine
// Uses:
//   1. Rule-based keyword scoring (fast, no API cost)
//   2. Claude AI for deeper semantic analysis
// ─────────────────────────────────────────────────────────────

const Anthropic = require("@anthropic-ai/sdk");
const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Keyword weights (language-agnostic important terms) ─────
const SCAM_KEYWORDS = {
  critical: {
    weight: 35,
    terms: [
      // English
      "otp","aadhaar","aadhar","pan card","pan number","cvv","arrest","cbi","narcotics",
      "account number","credit card","debit card pin","money mule","sim blocked",
      "bank account blocked","income tax notice","ed notice","enforcement directorate",
      // Transliterated Hindi/Indic
      "girftaar","pakad","nakli","fraud","khtara",
      // Arabic
      "رمز otp","اعتقال","احتيال",
      // Spanish
      "número de cuenta","código otp","arresto",
    ],
  },
  high: {
    weight: 20,
    terms: [
      "account will be blocked","verify account","lottery winner","prize money",
      "click the link","urgent action","money transfer","gift card","wire transfer",
      "kyc update","kyc verification","emi bounced","loan approved instantly",
      "job offer","work from home earn","crypto investment","double your money",
      // Hindi transliterated
      "khata band","paisa double","naukri","inam","lotri",
    ],
  },
  medium: {
    weight: 12,
    terms: [
      "verify","urgent","free money","you won","offer expires","limited time",
      "confirm your details","act now","blocked","suspended","click here",
      "don't share","congratulations","selected","eligible","call back immediately",
      "respond required","expires today","last chance","special offer","claim now",
      "immediate response","update kyc","verify now",
    ],
  },
  low: {
    weight: 5,
    terms: [
      "response required","expires","last chance","verify",
      "confirm","update","immediate","helpline",
    ],
  },
};

// ── Heuristic / pattern scoring ─────────────────────────────
function ruleBasedScore(text) {
  const lower = text.toLowerCase();
  let score    = 0;
  const matches = [];

  for (const [level, { weight, terms }] of Object.entries(SCAM_KEYWORDS)) {
    for (const term of terms) {
      if (lower.includes(term)) {
        score += weight;
        matches.push({ word: term, level });
      }
    }
  }

  // Pattern bonuses
  if (/\d{10}/.test(text))          score += 8;  // phone number in text
  if (/http[s]?:\/\//.test(lower))  score += 10; // URL present
  if (/bit\.ly|tinyurl|t\.me/.test(lower)) score += 15; // shortened/telegram link
  if (/\b[0-9]{6}\b/.test(text))    score += 5;  // 6-digit OTP-like number

  // Urgency pattern: ALL CAPS words
  const capsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  score += Math.min(capsWords * 4, 16);

  return { score: Math.min(score, 100), matches };
}

// ── Claude AI semantic analysis ───────────────────────────
async function aiScamAnalysis(text, language) {
  const prompt = `Analyze the following ${language !== "en" ? `text (language: ${language})` : "text"} for scam/fraud indicators.

Text: """
${text}
"""

Respond ONLY in this exact JSON format (no markdown, no explanation outside JSON):
{
  "verdict": "SCAM" | "SUSPICIOUS" | "SAFE",
  "riskScore": 0-100,
  "confidence": 0-100,
  "explanation": "2-3 sentence explanation in English",
  "scamType": "bank_impersonation" | "lottery" | "kyc_fraud" | "otp_theft" | "job_scam" | "investment" | "digital_arrest" | "phishing" | "none",
  "redFlags": ["flag1","flag2"]
}`;

  const response = await client.messages.create({
    model:      "claude-haiku-4-5-20251001", // Fast + cheap for analysis
    max_tokens: 400,
    messages:   [{ role: "user", content: prompt }],
  });

  const raw = response.content[0]?.text || "{}";
  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ── Main export ───────────────────────────────────────────
async function analyzeTextForScam(text, language = "en") {
  // 1. Fast rule-based pass
  const { score: ruleScore, matches } = ruleBasedScore(text);

  // 2. AI semantic pass (always run for accuracy)
  let aiResult = null;
  try {
    aiResult = await aiScamAnalysis(text, language);
  } catch (err) {
    console.warn("[scamDetector] AI analysis failed, using rules only:", err.message);
  }

  // 3. Blend scores (AI carries more weight)
  const finalScore = aiResult
    ? Math.round(ruleScore * 0.3 + aiResult.riskScore * 0.7)
    : ruleScore;

  const verdict =
    finalScore >= 70 ? "SCAM DETECTED" :
    finalScore >= 35 ? "SUSPICIOUS"     :
                       "SAFE";

  return {
    verdict,
    riskScore:   finalScore,
    confidence:  aiResult?.confidence ?? (ruleScore > 50 ? 85 : 70),
    matches,
    explanation: aiResult?.explanation ?? "Analysis based on pattern matching.",
    scamType:    aiResult?.scamType    ?? "unknown",
    redFlags:    aiResult?.redFlags    ?? [],
  };
}

module.exports = { analyzeTextForScam };
