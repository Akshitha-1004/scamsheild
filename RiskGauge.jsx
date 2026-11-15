// frontend/src/components/RiskGauge.jsx
import { useEffect, useRef } from "react";

// Animated SVG ring that fills from 0 → score
export default function RiskGauge({ score = 0, color = "#ff4060", size = 100 }) {
  const circleRef = useRef(null);
  const R = 40;
  const C = 2 * Math.PI * R; // ~251

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = C;
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1s ease";
      el.style.strokeDashoffset = C - (score / 100) * C;
    });
  }, [score, C]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="#1a2235" strokeWidth="8" />
        {/* Fill */}
        <circle
          ref={circleRef}
          cx="50" cy="50" r={R}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      {/* Label in center */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "IBM Plex Mono, monospace", color }}>
          {score}%
        </span>
        <span style={{ fontSize: 9, color: "#64748b" }}>RISK</span>
      </div>
    </div>
  );
}
