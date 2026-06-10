import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "https://chatboatbackend-ty3t.onrender.com/api/chat";

const SUGGESTIONS = [
  { icon: "💡", title: "Explain React hooks", sub: "with a simple example" },
  { icon: "🔐", title: "How does JWT work?", sub: "end-to-end auth flow" },
  { icon: "🍃", title: "MongoDB aggregation", sub: "group data by date" },
  { icon: "🚀", title: "REST API best practices", sub: "Node.js + Express tips" },
];

const HISTORY = [
  { label: "Today", items: ["Intro to Chandu", "React hooks explained", "MongoDB aggregation help"] },
  { label: "Yesterday", items: ["REST API best practices", "JWT vs sessions"] },
];

const LOADING_LINES = [
  "Soch raha hoon...",
  "Chai pi ke aa raha hoon ☕",
  "Jawab taiyaar ho raha hai...",
  "Ek second bhai...",
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/send`, { message: msg, chatId });
      if (!chatId) setChatId(res.data.chatId);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Yaar connection toot gayi. Ek chai pi aur dobara try kar! ☕" },
      ]);
    }
    setLoading(false);
  };

  const newChat = () => {
    setMessages([]);
    setChatId(null);
    setActiveChat(null);
    if (isMobile) setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const copyMsg = (idx, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const loadingLine = LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];

  return (
    <div style={styles.root}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      )}
      
      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(isMobile && {
          position: 'fixed',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000,
        })
      }}>
        <div style={styles.sbTop}>
          <button style={styles.newChatBtn} onClick={newChat}>
            <span style={styles.newChatIcon}>✏️</span>
            New chat
          </button>
          {isMobile && (
            <button 
              style={styles.closeSidebarBtn}
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          )}
        </div>

        <nav style={styles.sbNav}>
          {HISTORY.map((group) => (
            <div key={group.label}>
              <p style={styles.groupLabel}>{group.label}</p>
              {group.items.map((item, i) => {
                const idx = group.label === "Today" ? i : i + 3;
                return (
                  <button
                    key={item}
                    style={{ ...styles.historyItem, ...(activeChat === idx ? styles.historyItemActive : {}) }}
                    onClick={() => { 
                      setActiveChat(idx); 
                      setMessages([]); 
                      setChatId(null);
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    💬 {item}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={styles.sbFooter}>
          <div style={styles.userRow}>
            <div style={styles.avatarCircle}>VC</div>
            <div>
              <p style={styles.userName}>Vishal Chauhan</p>
              <p style={styles.userSub}>Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...styles.main,
        ...(isMobile && {
          marginLeft: 0,
          width: '100%',
        })
      }}>
        {/* Topbar */}
        <div style={{
          ...styles.topbar,
          ...(isMobile && {
            paddingLeft: 60, // Space for menu button
          })
        }}>
          <div style={styles.modelBadge}>
            <span style={styles.modelDot} />
            <span>Chandu Chaiwala ▾</span>
          </div>
          <div style={styles.topbarRight}>
            <button style={styles.iconBtn} title="Share">↗</button>
            <button style={styles.iconBtn} title="Settings">⚙️</button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🤖</div>
              <h2 style={styles.emptyTitle}>What's on your mind?</h2>
              <p style={styles.emptySub}>Ask me anything — code, life, or chai philosophy.</p>
              <div style={styles.suggGrid}>
                {SUGGESTIONS.map((sg) => (
                  <button
                    key={sg.title}
                    style={styles.suggCard}
                    onClick={() => send(sg.title + " " + sg.sub)}
                  >
                    <span style={styles.suggIcon}>{sg.icon}</span>
                    <p style={styles.suggTitle}>{sg.title}</p>
                    <p style={styles.suggSub}>{sg.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.msgList}>
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} style={styles.userMsgWrap}>
                    <div style={styles.userBubble}>{m.content}</div>
                    <div style={styles.userAvatar}>VC</div>
                  </div>
                ) : (
                  <div key={i} style={styles.aiMsgWrap}>
                    <div style={styles.aiAvatar}>🤖</div>
                    <div style={styles.aiMsgBody}>
                      <p style={styles.aiText}>{m.content}</p>
                      <div style={styles.msgActions}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => copyMsg(i, m.content)}
                        >
                          {copiedIdx === i ? "✅" : "📋"}
                        </button>
                        <button style={styles.actionBtn}>👍</button>
                        <button style={styles.actionBtn}>👎</button>
                      </div>
                    </div>
                  </div>
                )
              )}
              {loading && (
                <div style={styles.aiMsgWrap}>
                  <div style={styles.aiAvatar}>🤖</div>
                  <div style={styles.aiMsgBody}>
                    <p style={{ ...styles.aiText, color: "#888", fontSize: 13 }}>{loadingLine}</p>
                    <div style={styles.dots}>
                      <span style={{ ...styles.dot, animationDelay: "0s" }} />
                      <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                      <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <div style={styles.inputBox}>
            <textarea
              ref={inputRef}
              style={styles.textarea}
              value={input}
              rows={1}
              placeholder="Message Chandu..."
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={loading}
            />
            <button
              style={{ ...styles.sendBtn, opacity: input.trim() && !loading ? 1 : 0.3 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
          <p style={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </main>

      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.15; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f9f9f9",
    color: "#111",
    overflow: "hidden",
  },

  // Mobile Menu Button
  menuBtn: {
    position: "fixed",
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 8,
    border: "1px solid #e5e5e5",
    background: "#fff",
    cursor: "pointer",
    fontSize: 20,
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  // Overlay
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
    animation: "fadeIn 0.3s ease",
  },

  // Sidebar
  sidebar: {
    width: 260,
    background: "#f0f0f0",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #e5e5e5",
    height: "100vh",
    overflow: "hidden",
  },

  sbTop: {
    padding: "12px 10px",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  newChatBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    color: "#111",
  },

  closeSidebarBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  newChatIcon: { fontSize: 14 },
  
  sbNav: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 8px",
  },
  
  groupLabel: {
    fontSize: 11,
    color: "#999",
    padding: "8px 8px 4px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  
  historyItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "7px 10px",
    borderRadius: 7,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 12.5,
    color: "#555",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginBottom: 2,
    transition: "background 0.2s",
  },
  
  historyItemActive: {
    background: "#fff",
    color: "#111",
    fontWeight: 500,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  
  sbFooter: {
    padding: 10,
    borderTop: "1px solid #e5e5e5",
  },
  
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "6px 8px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  
  userName: { fontSize: 13, fontWeight: 500, color: "#111", margin: 0 },
  userSub: { fontSize: 11, color: "#999", marginTop: 1, margin: 0 },

  // Main Content
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    height: "100vh",
    overflow: "hidden",
  },
  
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: 52,
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
    background: "#fff",
  },
  
  modelBadge: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid #e5e5e5",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    color: "#111",
    background: "#fff",
  },
  
  modelDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#16a34a",
    flexShrink: 0,
  },
  
  topbarRight: { display: "flex", gap: 4 },
  
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 7,
    border: "1px solid #e5e5e5",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },

  // Chat Area
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 0",
  },

  // Empty State
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: 12,
    minHeight: "100%",
  },
  
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: 600, color: "#111", margin: 0 },
  emptySub: { fontSize: 14, color: "#888", margin: 0, textAlign: "center" },
  
  suggGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 10,
    width: "100%",
    maxWidth: 500,
    marginTop: 8,
  },
  
  suggCard: {
    textAlign: "left",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e5e5e5",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  
  suggIcon: { fontSize: 18, display: "block", marginBottom: 5 },
  suggTitle: { fontSize: 13, fontWeight: 500, color: "#111", margin: 0, marginBottom: 2 },
  suggSub: { fontSize: 12, color: "#888", margin: 0 },

  // Messages
  msgList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "0 20px",
    maxWidth: 760,
    margin: "0 auto",
    width: "100%",
  },
  
  userMsgWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
  },
  
  userBubble: {
    background: "#f3f4f6",
    borderRadius: "14px 14px 4px 14px",
    padding: "10px 14px",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#111",
    maxWidth: "70%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 10,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  
  aiMsgWrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
  },
  
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#f0f0f0",
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
    border: "1px solid #e5e5e5",
  },
  
  aiMsgBody: {
    flex: 1,
    maxWidth: "70%",
  },
  
  aiText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#111",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  
  msgActions: {
    display: "flex",
    gap: 4,
    marginTop: 8,
  },
  
  actionBtn: {
    padding: "3px 9px",
    borderRadius: 6,
    border: "1px solid #e5e5e5",
    background: "transparent",
    fontSize: 12,
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Typing Dots
  dots: {
    display: "flex",
    gap: 5,
    padding: "6px 0",
  },
  
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#aaa",
    animation: "blink 1.2s infinite",
    display: "inline-block",
  },

  // Input Area
  inputArea: {
    padding: "10px 20px 20px",
    flexShrink: 0,
    maxWidth: 760,
    margin: "0 auto",
    width: "100%",
  },
  
  inputBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    background: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: "10px 12px",
  },
  
  textarea: {
    flex: 1,
    border: "none",
    background: "transparent",
    resize: "none",
    fontSize: 14,
    color: "#111",
    fontFamily: "inherit",
    outline: "none",
    lineHeight: 1.5,
    maxHeight: 120,
    padding: 0,
  },
  
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
  },
  
  inputHint: {
    fontSize: 11,
    color: "#bbb",
    textAlign: "center",
    marginTop: 7,
  },
};