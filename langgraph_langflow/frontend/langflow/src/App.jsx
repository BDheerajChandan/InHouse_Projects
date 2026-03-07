// App.jsx

import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Node from "./components/Node";
import Canvas from "./components/Canvas";
import { runGraph } from "./services/api";

const getStyles = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${dark ? "#0a0a0f" : "#f4f3ef"};
    color: ${dark ? "#e8e4d9" : "#1a1a2e"};
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
    overflow: hidden;
    transition: background 0.3s, color 0.3s;
  }

  .app-shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  /* HEADER */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 28px;
    border-bottom: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    background: ${dark ? "#0d0d16" : "#eceae4"};
    flex-shrink: 0;
    transition: background 0.3s, border-color 0.3s;
  }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .header-title { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; color: ${dark ? "#e8e4d9" : "#1a1a2e"}; }
  .header-title span { color: #f97316; }
  .header-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
    background: ${dark ? "#1e1e2e" : "#e0ddd5"}; color: ${dark ? "#6b7280" : "#6b7280"};
    padding: 3px 10px; border-radius: 20px; border: 1px solid ${dark ? "#2a2a3e" : "#d0cdc5"};
  }

  /* THEME TOGGLE */
  .theme-toggle {
    background: ${dark ? "#1e1e2e" : "#e0ddd5"};
    border: 1px solid ${dark ? "#2a2a3e" : "#c8c5bc"};
    border-radius: 50px;
    padding: 5px 6px;
    display: flex; align-items: center; gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .theme-toggle:hover { border-color: #f97316; }
  .toggle-icon {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; transition: all 0.2s; cursor: pointer;
  }
  .toggle-icon.active {
    background: #f97316; color: #fff;
    box-shadow: 0 0 8px rgba(249,115,22,0.4);
  }
  .toggle-icon.inactive { color: ${dark ? "#4b5563" : "#9ca3af"}; }

  /* WORKSPACE */
  .workspace { display: flex; flex: 1; overflow: hidden; }

  /* LEFT PALETTE */
  .palette {
    width: 190px; flex-shrink: 0;
    background: ${dark ? "#0d0d16" : "#eceae4"};
    border-right: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    display: flex; flex-direction: column; padding: 18px 14px; gap: 8px; overflow-y: auto;
    transition: background 0.3s, border-color 0.3s;
  }
  .palette-label {
    font-size: 0.63rem; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.13em;
    color: ${dark ? "#4b5563" : "#9ca3af"}; margin-bottom: 6px;
  }

  /* CENTER CANVAS */
  .canvas-wrap {
    flex: 1; display: flex; flex-direction: column; overflow: hidden;
    background: ${dark ? "#0a0a0f" : "#f9f8f5"};
    background-image: radial-gradient(circle at 1px 1px, ${dark ? "#1a1a2e" : "#e0ddd7"} 1px, transparent 0);
    background-size: 28px 28px;
    transition: background 0.3s;
  }
  .canvas-scroll { flex: 1; overflow-y: auto; padding: 28px 28px 16px; }

  /* FLOW CONNECTION BAR */
  .flow-bar {
    flex-shrink: 0;
    padding: 9px 20px;
    background: ${dark ? "#0d0d16" : "#eceae4"};
    border-top: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    display: flex; align-items: center; gap: 0;
    overflow-x: auto; scrollbar-width: none;
    transition: background 0.3s, border-color 0.3s;
  }
  .flow-bar::-webkit-scrollbar { display: none; }
  .flow-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
    font-weight: 600; white-space: nowrap; flex-shrink: 0;
    transition: all 0.2s;
  }
  .flow-chip-start { background: #052e16; border: 1px solid #16a34a; color: #4ade80; }
  .flow-chip-end   { background: #1e1b4b; border: 1px solid #6366f1; color: #a5b4fc; }
  .flow-chip-mid   {
    background: ${dark ? "#1a1020" : "#fff3e8"};
    border: 1px solid ${dark ? "#3b1f10" : "#fed7aa"};
    color: ${dark ? "#fb923c" : "#c2410c"};
  }
  .flow-chip-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .chip-dot-g { background: #4ade80; }
  .chip-dot-o { background: #f97316; }
  .chip-dot-i { background: #818cf8; }
  .flow-arrow {
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
    color: ${dark ? "#2a2a3e" : "#c9c6c0"}; padding: 0 6px; flex-shrink: 0;
  }

  /* PROMPT BAR */
  .prompt-bar {
    flex-shrink: 0; display: flex; align-items: center; gap: 10px;
    padding: 13px 20px;
    background: ${dark ? "#0d0d16" : "#eceae4"};
    border-top: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    transition: background 0.3s, border-color 0.3s;
  }
  .prompt-input {
    flex: 1;
    background: ${dark ? "#13131f" : "#fff"};
    border: 1px solid ${dark ? "#2a2a3e" : "#d0cdc5"};
    border-radius: 8px; padding: 10px 14px;
    color: ${dark ? "#e8e4d9" : "#1a1a2e"};
    font-family: 'JetBrains Mono', monospace; font-size: 0.84rem;
    outline: none; transition: border-color 0.2s, background 0.3s;
  }
  .prompt-input:focus { border-color: #f97316; }
  .prompt-input::placeholder { color: ${dark ? "#374151" : "#b0aaa0"}; }
  .run-btn {
    background: #f97316; color: #fff; border: none; border-radius: 8px;
    padding: 10px 22px; font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 0.84rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .run-btn:hover:not(:disabled) { background: #fb923c; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,0.35); }
  .run-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* RIGHT RESULTS */
  .results-panel {
    width: 300px; flex-shrink: 0;
    background: ${dark ? "#0d0d16" : "#eceae4"};
    border-left: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    display: flex; flex-direction: column; overflow: hidden;
    transition: background 0.3s, border-color 0.3s;
  }
  .results-header {
    padding: 14px 20px; border-bottom: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    display: flex; align-items: center; gap: 8px;
    transition: border-color 0.3s;
  }
  .results-header-title {
    font-size: 0.65rem; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.13em;
    color: ${dark ? "#4b5563" : "#9ca3af"};
  }
  .results-status {
    margin-left: auto; width: 8px; height: 8px; border-radius: 50%;
    background: ${dark ? "#1e1e2e" : "#d0cdc5"}; transition: background 0.3s;
  }
  .results-status.loading { background: #f59e0b; animation: blink 1s infinite; }
  .results-status.success { background: #4ade80; }
  .results-status.errored { background: #ef4444; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  .results-body {
    flex: 1; overflow-y: auto; padding: 20px;
    scrollbar-width: thin;
    scrollbar-color: ${dark ? "#1e1e2e" : "#d0cdc5"} transparent;
  }
  .results-empty {
    height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px; text-align: center;
  }
  .results-empty-icon { font-size: 2.2rem; color: ${dark ? "#1e1e2e" : "#d0cdc5"}; }
  .results-empty-text {
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
    color: ${dark ? "#2a2a3e" : "#c0bdb5"}; line-height: 1.9;
  }
  .skeleton {
    height: 12px; border-radius: 4px; margin-bottom: 8px;
    background: linear-gradient(90deg,
      ${dark ? "#1a1a2e" : "#e0ddd7"} 25%,
      ${dark ? "#252540" : "#eceae4"} 50%,
      ${dark ? "#1a1a2e" : "#e0ddd7"} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes fadein { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }

  .results-meta {
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
    color: ${dark ? "#374151" : "#b0aaa0"}; margin-bottom: 10px;
  }
  .results-text {
    font-family: 'JetBrains Mono', monospace; font-size: 0.77rem;
    line-height: 1.9; color: ${dark ? "#d1d5db" : "#374151"};
    white-space: pre-wrap; word-break: break-word; animation: fadein 0.35s ease;
  }
  .results-error {
    font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
    color: #f87171; line-height: 1.7; animation: fadein 0.3s ease;
  }
  .flow-trace {
    margin-top: 18px; padding: 11px 14px;
    background: ${dark ? "#13131f" : "#fff"};
    border: 1px solid ${dark ? "#1e1e2e" : "#dddbd5"};
    border-radius: 7px; font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem; color: ${dark ? "#4b5563" : "#9ca3af"}; line-height: 1.9;
    transition: background 0.3s;
  }
  .flow-trace-label { color: ${dark ? "#374151" : "#b0aaa0"}; margin-bottom: 4px; }
`;

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function FlowBar({ sequence }) {
  const nodes = ["start", ...sequence.map((n) => n.name), "output"];
  return (
    <div className="flow-bar">
      {nodes.map((name, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === nodes.length - 1;
        const chipClass = isStart ? "flow-chip-start" : isEnd ? "flow-chip-end" : "flow-chip-mid";
        const dotClass = isStart ? "chip-dot-g" : isEnd ? "chip-dot-i" : "chip-dot-o";
        return (
          <React.Fragment key={`${name}-${idx}`}>
            <div className={`flow-chip ${chipClass}`}>
              <span className={`flow-chip-dot ${dotClass}`} />
              {name}
            </div>
            {idx < nodes.length - 1 && <span className="flow-arrow">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(true);
  const [availableNodes] = useState([
    { id: 1, name: "node1_openai" },
    { id: 2, name: "node2_gemniai" },
    { id: 3, name: "node3_uppercase" },
  ]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sequence, setSequence] = useState([]);
  const [lastFlow, setLastFlow] = useState([]);

  const handleRun = async () => {
    if (!prompt.trim()) return alert("Enter a prompt");

    // If no nodes dragged, default is direct start → output (empty sequence)
    const nodeNames = sequence.map((n) => n.name);
    setLastFlow(["start", ...nodeNames, "output"]);
    setLoading(true);
    setError("");
    setResult("");

    try {
      const output = await runGraph(nodeNames, prompt);
      setResult(output);
    } catch (err) {
      setError("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const statusClass = loading ? "loading" : result ? "success" : error ? "errored" : "";

  return (
    <DndProvider backend={HTML5Backend}>
      <style>{getStyles(dark)}</style>
      <div className="app-shell">

        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <div className="header-title">Lang<span>Flow</span> By Dheeraj</div>
            <div className="header-badge">drag & drop graph builder</div>
          </div>

          {/* THEME TOGGLE */}
          <div className="theme-toggle" onClick={() => setDark((d) => !d)}>
            <div className={`toggle-icon ${!dark ? "active" : "inactive"}`}>
              <SunIcon />
            </div>
            <div className={`toggle-icon ${dark ? "active" : "inactive"}`}>
              <MoonIcon />
            </div>
          </div>
        </header>

        <div className="workspace">

          {/* LEFT: PALETTE */}
          <aside className="palette">
            <div className="palette-label">Nodes</div>
            {availableNodes.map((n) => (
              <Node key={n.id} node={n} dark={dark} />
            ))}
          </aside>

          {/* CENTER: CANVAS + FLOW BAR + PROMPT */}
          <div className="canvas-wrap">
            <div className="canvas-scroll">
              <Canvas sequence={sequence} setSequence={setSequence} dark={dark} />
            </div>

            {/* FLOW CONNECTION BAR */}
            <FlowBar sequence={sequence} />

            <div className="prompt-bar">
              <input
                className="prompt-input"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="Enter your prompt and run the flow…"
              />
              <button className="run-btn" onClick={handleRun} disabled={loading}>
                {loading ? "Running…" : "▶  Run"}
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <aside className="results-panel">
            <div className="results-header">
              <span className="results-header-title">Output</span>
              <div className={`results-status ${statusClass}`} />
            </div>
            <div className="results-body">
              {!loading && !result && !error && (
                <div className="results-empty">
                  <div className="results-empty-icon">◈</div>
                  <div className="results-empty-text">Build your flow,<br />enter a prompt,<br />hit Run.</div>
                </div>
              )}
              {loading && (
                <>
                  <div className="skeleton" style={{ width: "75%" }} />
                  <div className="skeleton" style={{ width: "55%" }} />
                  <div className="skeleton" style={{ width: "88%" }} />
                  <div className="skeleton" style={{ width: "45%" }} />
                  <div className="skeleton" style={{ width: "68%" }} />
                </>
              )}
              {!loading && error && <div className="results-error">{error}</div>}
              {!loading && result && (
                <>
                  <div className="results-meta">// result</div>
                  <div className="results-text">{result}</div>
                  {lastFlow.length > 0 && (
                    <div className="flow-trace">
                      <div className="flow-trace-label">// executed flow</div>
                      {lastFlow.join(" → ")}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>

        </div>
      </div>
    </DndProvider>
  );
}

export default App;