// frontend/src/components/Translate.jsx
import { useState } from "react";
import { translateAndAnalyze } from "../services/scamService";

const LANGUAGES = [
  { code: "auto", label: "🌐 Auto-Detect" },
  // Indian languages
  { code: "hi", label: "🇮🇳 Hindi" },
  { code: "te", label: "🇮🇳 Telugu" },
  { code: "ta", label: "🇮🇳 Tamil" },
  { code: "kn", label: "🇮🇳 Kannada" },
  { code: "ml", label: "🇮🇳 Malayalam" },
  { code: "mr", label: "🇮🇳 Marathi" },
  { code: "bn", label: "🇮🇳 Bengali" },
  { code: "gu", label: "🇮🇳 Gujarati" },
  { code: "pa", label: "🇮🇳 Punjabi" },
  { code: "or", label: "🇮🇳 Odia" },
  { code: "as", label: "🇮🇳 Assamese" },
  { code: "ur", label: "🇵🇰 Urdu" },
  { code: "si", label: "🇱🇰 Sinhala" },
  // World languages
  { code: "en", label: "🇺🇸 English" },
  { code: "es", label: "🇪🇸 Spanish" },
  { code: "fr", label: "🇫🇷 French" },
  { code: "de", label: "🇩🇪 German" },
  { code: "ar", label: "🇸🇦 Arabic" },
  { code: "zh", label: "🇨🇳 Chinese (Simplified)" },
  { code: "ja", label: "🇯🇵 Japanese" },
  { code: "ko", label: "🇰🇷 Korean" },
  { code: "ru", label: "🇷🇺 Russian" },
  { code: "pt", label: "🇧🇷 Portuguese" },
  { code: "it", label: "🇮🇹 Italian" },
  { code: "tr", label: "🇹🇷 Turkish" },
  { code: "vi", label: "🇻🇳 Vietnamese" },
  { code: "th", label: "🇹🇭 Thai" },
  { code: "id", label: "🇮🇩 Indonesian" },
  { code: "ms", label: "🇲🇾 Malay" },
  { code: "sw", label: "🇰🇪 Swahili" },
  { code: "fa", label: "🇮🇷 Persian" },
  { code: "nl", label: "🇳🇱 Dutch" },
  { code: "pl", label: "🇵🇱 Polish" },
];

export default function Translate({ onHistory }) {
  const [inputText, setInputText] = useState("");
  const [fromLang, setFromLang]   = useState("auto");
  const [toLang, setToLang]       = useState("en");
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);

  async function handleTranslate() {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await translateAndAnalyze(inputText, toLang);
      setResult(data);
      onHistory?.({ type: "translate", preview: inputText.slice(0, 60), result: data });
    } catch (e) {
      alert("Translation failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function swapLangs() {
    if (fromLang === "auto") return;
    const tmp = fromLang;
    setFromLang(toLang);
    setToLang(tmp);
    setInputText(result?.translated || inputText);
    setResult(null);
  }

  const riskColor = result
    ? result.riskScore >= 70 ? "#ff4060" : result.riskScore >= 35 ? "#ffa040" : "#00e676"
    : "#fff";

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Language Translation</h2>
        <p>Translate messages across 30+ languages with automatic scam detection</p>
      </div>

      {/* Pipeline visual */}
      <div className="card mb-16">
        <p className="micro-label mb-10">AI TRANSLATION PIPELINE</p>
        <div className="pipeline-row">
          {["🎯 Input", "→", "🔍 Detect Language", "→", "🌐 Neural MT", "→", "🛡️ Scam Scan", "→", "✅ Result"].map((s, i) => (
            <div key={i} className={s === "→" ? "pipeline-arrow" : "pipeline-node"}>{s}</div>
          ))}
        </div>
      </div>

      <div className="translate-grid">
        {/* Input side */}
        <div className="col">
          <select className="lang-select w-full mb-10" value={fromLang} onChange={(e) => setFromLang(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <textarea
            className="input-field textarea"
            rows={8}
            placeholder="Enter text to translate…&#10;&#10;Supports Hindi, Telugu, Tamil, Arabic, Chinese and 30+ more languages."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button className="btn-primary w-full mt-10" onClick={handleTranslate} disabled={loading}>
            {loading ? "Translating…" : "🌐 Translate"}
          </button>
        </div>

        {/* Swap button */}
        <div className="swap-col">
          <button className="swap-btn" onClick={swapLangs}>⇄</button>
        </div>

        {/* Output side */}
        <div className="col">
          <select className="lang-select w-full mb-10" value={toLang} onChange={(e) => setToLang(e.target.value)}>
            {LANGUAGES.filter((l) => l.code !== "auto").map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <div className="card translate-output" style={{ minHeight: 180 }}>
            {loading ? (
              <div className="flex-center" style={{ height: 120 }}>
                <div className="spinner" />
              </div>
            ) : result ? (
              <p className="small" style={{ lineHeight: 1.7 }}>{result.translated}</p>
            ) : (
              <p className="muted" style={{ fontStyle: "italic" }}>Translation will appear here…</p>
            )}
          </div>

          {result && (
            <div className="card-sm mt-10">
              <div className="row-gap">
                <span className="micro-label">SCAM ANALYSIS</span>
                <span className={`badge badge-${result.riskScore >= 70 ? "scam" : result.riskScore >= 35 ? "sus" : "safe"}`}>
                  ● {result.riskScore >= 70 ? "SCAM" : result.riskScore >= 35 ? "SUSPICIOUS" : "SAFE"}
                </span>
              </div>
              <div className="row-gap mt-8">
                <span className="muted tiny">Risk:</span>
                <div className="progress-bar flex-1">
                  <div className="progress-fill" style={{ width: result.riskScore + "%", background: riskColor }} />
                </div>
                <span className="fw-600 small" style={{ color: riskColor }}>{result.riskScore}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
