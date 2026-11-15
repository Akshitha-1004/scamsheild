// frontend/src/components/History.jsx
export default function History({ log, onClear }) {
  return (
    <div className="panel">
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Detection History</h2>
          <p>All your past analysis sessions</p>
        </div>
        {log.length > 0 && (
          <button className="ghost-btn" onClick={onClear}>Clear All</button>
        )}
      </div>

      {log.length === 0 ? (
        <div className="placeholder-card card">
          <div className="placeholder-icon">📋</div>
          <p>No analysis history yet</p>
          <p className="muted small mt-4">Your detection results will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {log.map((item, i) => {
            const color = item.result.riskScore >= 70 ? "#ff4060"
              : item.result.riskScore >= 35 ? "#ffa040" : "#00e676";
            return (
              <div key={i} className="card-sm history-row">
                <span style={{ fontSize: 22 }}>{item.type === "audio" ? "🎵" : item.type === "translate" ? "🌐" : "💬"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="small fw-600 truncate">{item.preview}</p>
                  <p className="muted tiny">{item.time.toLocaleString()}</p>
                </div>
                <span
                  className={`badge badge-${item.result.riskScore >= 70 ? "scam" : item.result.riskScore >= 35 ? "sus" : "safe"}`}
                  style={{ fontSize: 10, flexShrink: 0 }}
                >
                  {item.result.riskScore}% — {item.result.verdict}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
