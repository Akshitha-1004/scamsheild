// frontend/src/components/TextAnalyze.jsx
import { useState } from "react";
import { analyzeText } from "../services/scamService";
import RiskGauge from "./RiskGauge";

const DEMO_TEXTS = [
  "Dear customer, your SBI account has been compromised. Share your OTP and Aadhaar number immediately to avoid arrest by CBI officials. Call 9XXXXXXXXX urgently.",
  "CONGRATULATIONS! You won Rs 50,00,000 in KBC Lottery 2024. Share your bank account number and CVV to claim. Offer expires in 2 hours!",
  "Your KYC is pending. Your UPI ID will be blocked tonight. Call helpline and share your Aadhaar OTP to avoid account suspension.",
];

export default function TextAnalyze({ onHistory }) {
  const [text, setText]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("");

  const STEPS = [
    "Detecting language...",
    "Scanning for fraud indicators...",
    "Analyzing urgency signals...",
    "Computing risk score...",
  ];

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    // Cycle through status messages
    let i = 0;
    const interval = setInterval(() => {
      setStep(STEPS[i % STEPS.length]);
      i++;
    }, 500);

    try {
      const data = await analyzeText(text);
      setResult(data);
      onHistory?.({ type: "text", preview: text.slice(0, 60), result: data });
    } catch (e) {
      alert("Analysis failed: " + e.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStep("");
    }
  }

  const verdictColor = result
    ? result.riskScore >= 70 ? "#ff4060"
    : result.riskScore >= 35 ? "#ffa040"
    : "#00e676"
    : "#fff";

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Message & Call Analysis</h2>
        <p>Paste any suspicious message, call transcript or text to detect scam patterns</p>
      </div>

      <div className="two-col">
        {/* LEFT — Input */}
        <div className="col">
          <div className="card">
            <div className="card-title-row">
              <span>📋 PASTE MESSAGE / TEXT</span>
              <button className="ghost-btn" onClick={() => { setText(""); setResult(null); }}>Clear</button>
            </div>
            <textarea
              className="input-field textarea"
              placeholder={`Paste suspicious message here...\n\nExample: 'Dear customer, your bank account has been compromised...'`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
            />
            <div className="row-gap mt-12">
              <button className="btn-primary flex-1" onClick={handleAnalyze} disabled={loading}>
                🔍 Analyze Now
              </button>
              <button
                className="btn-ghost"
                onClick={() => setText(DEMO_TEXTS[Math.floor(Math.random() * DEMO_TEXTS.length)])}
              >
                Try Demo
              </button>
            </div>
          </div>

          {/* Keyword chips */}
          {result?.matches?.length > 0 && (
            <div className="card-sm">
              <p className="micro-label">RISK INDICATORS FOUND</p>
              <div className="chip-wrap">
                {result.matches.slice(0, 10).map((m, i) => (
                  <span key={i} className={`chip chip-${m.level}`}>
                    {m.level.toUpperCase()}: {m.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Result */}
        <div className="col">
          {!loading && !result && (
            <div className="card placeholder-card">
              <div className="placeholder-icon">🔍</div>
              <p>Results will appear here after analysis</p>
            </div>
          )}

          {loading && (
            <div className="card loading-card">
              <div className="spinner-wrap">
                <div className="spinner" />
                <span className="spinner-emoji">🔍</span>
              </div>
              <p className="fw-600">Scanning message…</p>
              <p className="muted small">{step}</p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="card">
                <div className="card-title-row">
                  <span>ANALYSIS RESULT</span>
                  <span className={`badge badge-${result.riskScore >= 70 ? "scam" : result.riskScore >= 35 ? "sus" : "safe"}`}>
                    ● {result.verdict}
                  </span>
                </div>
                <div className="result-row">
                  <RiskGauge score={result.riskScore} color={verdictColor} />
                  <div className="result-meta">
                    <div className="verdict-text" style={{ color: verdictColor }}>
                      {result.verdict}
                    </div>
                    <div className="muted small">
                      AI Confidence: {result.confidence}% | {result.matches?.length ?? 0} indicator(s)
                    </div>
                    <div className="progress-bar mt-8">
                      <div
                        className="progress-fill"
                        style={{ width: result.riskScore + "%", background: verdictColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-sm mt-12">
                <p className="micro-label">DETAILED BREAKDOWN</p>
                {result.explanation && (
                  <p className="small" style={{ color: "#94a3b8", lineHeight: 1.6 }}>
                    {result.explanation}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
