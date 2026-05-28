import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:3000/api/chat";

const PLACEHOLDERS = [
  "Bol bhai kya scene hai... 😎",
  "Pucho beta kya puchna hai...",
  "AI se panga mat lena 😤",
  "Kaleen Bhaiya sun rahe hain...",
  "Kya problem hai tujhe?",
  "Baat kar, darr mat... 🔫",
];

const LOADING_TEXTS = [
  "Kaleen Bhaiya soch rahe hain... 👑",
  "Guddu typing... 💪",
  "Munna bhai plan bana raha hai... 😈",
  "Tripathi ji ka jawab aa raha hai...",
  "Purvanchal se signal aa raha hai... 📡",
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) {
      setLoadingText(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
    }
  }, [loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/send`, {
        message: userText,
        chatId: chatId,
      });

      if (!chatId) setChatId(res.data.chatId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "☕ Arre bhai! Connection toot gayi. Ek chai pi aur dobara try kar!" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="desi-wrapper">

      {/* Grain texture overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Smoke layers */}
      <div className="smoke smoke-1" aria-hidden="true" />
      <div className="smoke smoke-2" aria-hidden="true" />
      <div className="smoke smoke-3" aria-hidden="true" />

      {/* Flicker light */}
      <div className="flicker-light" aria-hidden="true" />

      <div className="container-fluid h-100 d-flex align-items-center justify-content-center p-2 p-md-4">
        <div className="chat-panel">

          {/* ── HEADER ── */}
          <div className="chat-header">
            <div className="header-left">
              <div className="don-avatar">
                <span className="avatar-emoji">👑</span>
                <div className="avatar-glow" />
              </div>
              <div className="header-info">
                <h1 className="header-title">CHANDU CHAIWALA</h1>
                <div className="header-sub">
                  <span className="status-dot" />
                  <span className="status-text">PURVANCHAL ONLINE</span>
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className="header-quote">"Chai piyo ya maro" ☕</div>
            </div>
          </div>

          {/* ── GANGSTER QUOTE BAR ── */}
          <div className="quote-bar">
            <span>⚔️</span>
            <span className="quote-text">Izzat se jiyo, izzat se maro — Kaleen Bhaiya</span>
            <span>⚔️</span>
          </div>

          {/* ── MESSAGES ── */}
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-skull">☕</div>
                <p className="empty-title">CHAI PE CHARCHA</p>
                <p className="empty-sub">Kuch bhi pucho... Chandu hazir hai</p>
                <div className="empty-divider">
                  <span>✦</span><span>✦</span><span>✦</span>
                </div>
                <p className="empty-quote">"Picture abhi baaki hai mere dost 🎬"</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`msg-row ${msg.role === "user" ? "msg-user" : "msg-ai"}`}
              >
                {msg.role === "assistant" && (
                  <div className="msg-avatar ai-avatar">☕</div>
                )}

                <div className={`msg-bubble ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}>
                  {msg.role === "assistant" && (
                    <span className="bubble-label">⚡ CHANDU</span>
                  )}
                  {msg.role === "user" && (
                    <span className="bubble-label user-label">TU 👤</span>
                  )}
                  <p className="bubble-text">{msg.content}</p>
                </div>

                {msg.role === "user" && (
                  <div className="msg-avatar user-avatar">😤</div>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="msg-row msg-ai">
                <div className="msg-avatar ai-avatar">☕</div>
                <div className="msg-bubble bubble-ai">
                  <span className="bubble-label">⚡ CHANDU</span>
                  <div className="loading-content">
                    <p className="loading-text">{loadingText}</p>
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── INPUT ── */}
          <div className="chat-footer">
            <div className="input-wrapper">
              <input
                type="text"
                className="desi-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={placeholder}
                disabled={loading}
                autoFocus
              />
              <button
                className={`send-btn ${loading ? "send-disabled" : ""}`}
                onClick={sendMessage}
                disabled={loading}
                aria-label="Send"
              >
                🔫
              </button>
            </div>
            <p className="footer-hint">
              ☕ Chandu Chaiwala · Chai + Bollywood + Mirzapur = 🔥
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}