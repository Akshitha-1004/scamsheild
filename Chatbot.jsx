// frontend/src/components/Chatbot.jsx
import { useState } from "react";
import { chatWithBot } from "../services/scamService";

const INITIAL_MSG = {
  role: "assistant",
  content: "Hi! I'm ScamShield AI 🛡️. I can help you identify scams, fraudulent calls, and suspicious messages. Ask me anything about fraud protection!",
};

const QUICK_CHIPS = [
  "What are common phone scams in India?",
  "How do I identify OTP fraud?",
  "Explain Digital Arrest scam",
  "What to do if I got scammed?",
  "How does KYC fraud work?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function sendMessage(text = input) {
    const msg = text.trim();
    if (!msg) return;
    setInput("");
    const newHistory = [...messages, { role: "user", content: msg }];
    setMessages(newHistory);
    setLoading(true);
    try {
      const { reply } = await chatWithBot(newHistory);
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div className="panel-header">
        <h2>ScamShield Assistant</h2>
        <p>Ask me anything about scams, fraud patterns and how to stay safe</p>
      </div>

      {/* Messages */}
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-row ${m.role}`}>
            <div className={`chat-avatar ${m.role}`}>
              {m.role === "assistant" ? "🛡️" : "👤"}
            </div>
            <div className={`chat-bubble ${m.role}`} style={{ whiteSpace: "pre-line" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-row assistant">
            <div className="chat-avatar assistant">🛡️</div>
            <div className="chat-bubble assistant muted">Thinking…</div>
          </div>
        )}
      </div>

      {/* Quick chips */}
      <div className="chip-row">
        {QUICK_CHIPS.map((c) => (
          <button key={c} className="quick-chip" onClick={() => sendMessage(c)}>{c}</button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="input-field flex-1"
          type="text"
          placeholder="Ask about scam types, red flags…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button className="btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
