// frontend/src/pages/OtpPage.jsx
import { useState, useRef } from "react";
import { verifyOTP } from "../services/authService";

export default function OtpPage({ phone, onVerified, onBack }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState("");
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  function handleDigit(idx, val) {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) refs[idx + 1].current.focus();
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < 6) { setError("Enter all 6 digits"); return; }
    try {
      setLoading(true);
      setError("");
      const user = await verifyOTP(code);
      onVerified(user);
    } catch (e) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Paste handler — fills all 6 boxes
  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      refs[5].current.focus();
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <div className="auth-logo">📱</div>
        <h2>Verify your number</h2>
        <p className="auth-subtitle">
          6-digit OTP sent to <span className="highlight">{phone}</span>
        </p>

        <div className="otp-row" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              className="otp-box"
              type="tel"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          className="btn-primary w-full"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>

        <p className="terms-text">
          Didn't receive?{" "}
          <span className="link" onClick={() => window.location.reload()}>
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}
