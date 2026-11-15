// frontend/src/pages/Dashboard.jsx
import { useState } from "react";
import TextAnalyze from "../components/TextAnalyze";
import AudioAnalyze from "../components/AudioAnalyze";
import Translate   from "../components/Translate";
import Chatbot     from "../components/Chatbot";
import History     from "../components/History";
import "../styles/dashboard.css";

const TABS = [
  { id: "analyze",   icon: "🔍", label: "Analyze"   },
  { id: "audio",     icon: "🎙️", label: "Audio"     },
  { id: "translate", icon: "🌐", label: "Translate"  },
  { id: "chatbot",   icon: "💬", label: "Chat"       },
  { id: "history",   icon: "🕐", label: "History"    },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab]       = useState("analyze");
  const [historyLog, setHistoryLog]     = useState([]);

  function addHistory(entry) {
    setHistoryLog((prev) => [{ ...entry, time: new Date() }, ...prev]);
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="db-header">
        <div className="db-brand">
          <span>🛡️</span>
          <span className="glow-text">ScamShield AI</span>
        </div>
        <div className="db-header-right">
          <span className="status-dot" />
          <span className="status-label">Protected</span>
          <button className="user-pill" onClick={onLogout}>
            <div className="avatar">
              {(user?.displayName || user?.phoneNumber || "U")[0].toUpperCase()}
            </div>
            <span>{user?.displayName || user?.phoneNumber || "User"}</span>
          </button>
        </div>
      </header>

      <div className="db-body">
        {/* Sidebar */}
        <aside className="sidebar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`sidebar-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
              title={t.label}
            >
              <span className="s-icon">{t.icon}</span>
              <span className="s-label">{t.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Panel */}
        <main className="db-main">
          {activeTab === "analyze"   && <TextAnalyze   onHistory={addHistory} />}
          {activeTab === "audio"     && <AudioAnalyze  onHistory={addHistory} />}
          {activeTab === "translate" && <Translate      onHistory={addHistory} />}
          {activeTab === "chatbot"   && <Chatbot />}
          {activeTab === "history"   && <History log={historyLog} onClear={() => setHistoryLog([])} />}
        </main>
      </div>
    </div>
  );
}
