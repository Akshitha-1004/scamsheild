// backend/routes/chat.js
const express  = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const router   = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are ScamShield AI, an expert fraud detection and cybersecurity assistant.
Your primary role is helping users in India and worldwide identify scams, fraudulent calls, 
phishing messages, and online fraud.

You have deep expertise in:
- Phone scams (OTP fraud, bank impersonation, Digital Arrest scam)
- Indian-specific scams (KYC fraud, Aadhaar fraud, UPI fraud, fake job offers)
- WhatsApp and SMS phishing
- Investment and lottery scams
- What to do after being scammed (report to 1930, cybercrime.gov.in)

Guidelines:
- Be direct and clear about whether something is a scam
- Provide actionable advice
- Mention specific Indian helplines (1930, cybercrime.gov.in, RBI 14448) when relevant
- Support questions in any language but always respond in the same language the user wrote in
- Keep responses concise but complete
- Use emojis sparingly to make responses friendlier`;

// ── POST /api/chat ─────────────────────────────────────────
// Body: { messages: [{ role: "user"|"assistant", content: string }] }
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ error: "messages array is required" });

    // Keep only last 20 messages to stay within context limits
    const trimmed = messages.slice(-20);

    const response = await client.messages.create({
      model:      "claude-opus-4-5",
      max_tokens: 600,
      system:     SYSTEM_PROMPT,
      messages:   trimmed,
    });

    const reply = response.content[0]?.text || "I couldn't generate a response. Please try again.";
    return res.json({ reply });

  } catch (err) {
    console.error("[chat]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
