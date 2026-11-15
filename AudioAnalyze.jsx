// frontend/src/components/AudioAnalyze.jsx
import { useState, useRef } from "react";
import { analyzeAudio } from "../services/scamService";
import RiskGauge from "./RiskGauge";

export default function AudioAnalyze({ onHistory }) {
  const [recording, setRecording]     = useState(false);
  const [recSeconds, setRecSeconds]   = useState(0);
  const [audioBlob, setAudioBlob]     = useState(null);
  const [audioName, setAudioName]     = useState("");
  const [processing, setProcessing]   = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 1 2 (pipeline steps)
  const [result, setResult]           = useState(null);
  const mediaRef  = useRef(null);
  const timerRef  = useRef(null);
  const chunksRef = useRef([]);

  // ── Upload ─────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAudioBlob(file);
    setAudioName(file.name);
    setResult(null);
  }

  // ── Record ─────────────────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioName("recording.webm");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (err) {
      alert("Microphone access denied: " + err.message);
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  }

  function fmtTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // ── Process ────────────────────────────────────────────────
  async function processAudio() {
    if (!audioBlob) { alert("Upload or record audio first"); return; }
    setProcessing(true);
    setCurrentStep(0);
    setResult(null);

    try {
      const data = await analyzeAudio(audioBlob, audioName);
      setResult(data);
      onHistory?.({ type: "audio", preview: `Audio: ${data.transcript?.slice(0, 50)}`, result: data });
    } catch (e) {
      alert("Audio analysis failed: " + e.message);
    } finally {
      setProcessing(false);
      setCurrentStep(-1);
    }
  }

  const verdictColor = result
    ? result.riskScore >= 70 ? "#ff4060" : result.riskScore >= 35 ? "#ffa040" : "#00e676"
    : "#fff";

  const PIPELINE_STEPS = [
    { icon: "🤖", label: "Whisper AI: Speech recognition" },
    { icon: "🌐", label: "Language detection & normalization" },
    { icon: "🛡️", label: "Fraud pattern detection" },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Voice Analysis</h2>
        <p>Upload audio or record a call — AI transcribes and detects scam patterns in real-time</p>
      </div>

      <div className="two-col">
        {/* LEFT */}
        <div className="col">
          {/* Upload */}
          <div className="card">
            <p className="micro-label">📁 UPLOAD AUDIO FILE</p>
            <label
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) { setAudioBlob(file); setAudioName(file.name); setResult(null); }
              }}
            >
              <input type="file" accept="audio/*" onChange={handleFileChange} hidden />
              <div className="drop-icon">🎵</div>
              <p className="fw-600 small">Drop audio file here or click to browse</p>
              <p className="muted tiny">MP3 · WAV · M4A · OGG · FLAC · WEBM</p>
            </label>
            {audioBlob && (
              <div className="file-pill mt-8">
                🎵 <span>{audioName}</span>
                <span className="muted tiny ml-auto">
                  {audioBlob instanceof File ? (audioBlob.size / 1024).toFixed(1) + " KB" : "Recording"}
                </span>
              </div>
            )}
          </div>

          {/* Record */}
          <div className="card mt-12">
            <p className="micro-label">🎙️ LIVE RECORDING</p>
            <div className="record-center">
              <button
                className={`record-btn ${recording ? "recording" : ""}`}
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? "⏹" : "🎙️"}
              </button>
              <div>
                <p className="fw-600" style={{ color: recording ? "#ff4060" : "#e2e8f0" }}>
                  {recording ? "● Recording…" : "Tap to Record"}
                </p>
                {recording && <p className="muted small">{fmtTime(recSeconds)}</p>}
              </div>
              {/* Waveform animation when recording */}
              {recording && (
                <div className="waveform">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <button className="btn-primary w-full mt-12" onClick={processAudio} disabled={!audioBlob || processing}>
            {processing ? "Processing…" : "⚡ Analyze Audio"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="col">
          {/* Pipeline steps while processing */}
          {processing && (
            <div className="card">
              <p className="fw-600 mb-12">Processing Audio…</p>
              {PIPELINE_STEPS.map((s, i) => (
                <div key={i} className={`pipeline-step ${i <= currentStep ? "active" : "inactive"}`}>
                  <span className={i === currentStep ? "spin-emoji" : ""}>{s.icon}</span>
                  <span className="small">{s.label}</span>
                  {i < currentStep && <span className="ml-auto">✅</span>}
                </div>
              ))}
            </div>
          )}

          {/* Result */}
          {result && !processing && (
            <div className="card text-center">
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {result.riskScore >= 70 ? "🚨" : result.riskScore >= 35 ? "⚠️" : "✅"}
              </div>
              <div className="verdict-text" style={{ color: verdictColor }}>{result.verdict}</div>
              <div className="risk-pct" style={{ color: verdictColor }}>{result.riskScore}%</div>
              <div className="progress-bar mt-8 mb-12">
                <div className="progress-fill" style={{ width: result.riskScore + "%", background: verdictColor }} />
              </div>
              {result.transcript && (
                <div className="transcript-box">
                  <p className="micro-label mb-6">📝 TRANSCRIPT (Whisper AI)</p>
                  <p className="small" style={{ lineHeight: 1.7 }}>{result.transcript}</p>
                </div>
              )}
              {result.detectedLanguageName && (
                <div className="lang-pill mt-8">
                  🌐 Detected: <strong>{result.detectedLanguageName}</strong>
                </div>
              )}
              <p className="muted tiny mt-8">{result.matches?.length ?? 0} suspicious pattern(s) · Confidence: {result.confidence}%</p>
            </div>
          )}

          {/* Placeholder */}
          {!processing && !result && (
            <div className="card placeholder-card">
              <div className="placeholder-icon">🎧</div>
              <p>Upload or record audio to begin analysis</p>
              <ul className="feature-list mt-8">
                <li>✓ Whisper AI speech recognition</li>
                <li>✓ 50+ languages supported</li>
                <li>✓ Real-time fraud detection</li>
                <li>✓ All Indian regional languages</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
