// src/components/Canvas.jsx

import React from "react";
import { useDrop } from "react-dnd";
import { v4 as uuidv4 } from "uuid";

const getCanvasStyles = (dark) => `
  .flow-node {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 18px; border-radius: 10px;
    font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600;
    width: fit-content; min-width: 170px; user-select: none;
  }
  .flow-node-start { background: #052e16; border: 1.5px solid #16a34a; color: #4ade80; }
  .flow-node-end   { background: #1e1b4b; border: 1.5px solid #6366f1; color: #a5b4fc; }

  .node-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-green  { background: #4ade80; box-shadow: 0 0 7px #4ade80aa; }
  .dot-indigo { background: #818cf8; box-shadow: 0 0 7px #818cf8aa; }

  /* Vertical connector */
  .v-line {
    width: 2px;
    background: ${dark
    ? "linear-gradient(to bottom, #1a3a28, #252548)"
    : "linear-gradient(to bottom, #bbf7d0, #c7d2fe)"};
    margin-left: 33px; flex-shrink: 0;
  }
  .v-line-short { height: 16px; }

  /* Direct arrow when no nodes (default flow) */
  .direct-arrow {
    display: flex; flex-direction: column; align-items: flex-start;
    margin-left: 22px;
    border-left: 2px dashed ${dark ? "#2a2a3e" : "#d0cdc5"};
    padding: 10px 0 10px 20px; gap: 4px;
    transition: border-color 0.3s;
  }
  .direct-label {
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
    color: ${dark ? "#374151" : "#b0aaa0"};
    font-style: italic;
  }

  /* Drop rail (when nodes exist or hovering) */
  .drop-rail {
    display: flex; flex-direction: column;
    margin-left: 22px;
    border-left: 2px solid ${dark ? "#1e1e2e" : "#d0cdc5"};
    padding-left: 22px; transition: border-color 0.25s;
  }
  .drop-rail.over { border-color: #f97316; }

  .drop-inner {
    min-height: 72px; border: 2px dashed ${dark ? "#1e1e2e" : "#d0cdc5"};
    border-radius: 10px; display: flex; flex-direction: column;
    gap: 8px; padding: 8px; transition: all 0.2s;
  }
  .drop-inner.over { border-color: #f97316; background: rgba(249,115,22,0.05); }

  .drop-placeholder {
    display: flex; align-items: center; justify-content: center; height: 52px;
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
    color: ${dark ? "#2a2a3e" : "#c0bdb5"}; border-radius: 8px; transition: color 0.2s;
  }
  .drop-placeholder.over { color: #f97316; }

  /* Sequence rows */
  .seq-row {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px;
    background: ${dark ? "#13131f" : "#fff"};
    border: 1px solid ${dark ? "#2a2a3e" : "#dddbd5"};
    border-radius: 8px; font-family: 'JetBrains Mono', monospace;
    font-size: 0.77rem; color: ${dark ? "#d1d5db" : "#374151"};
    transition: border-color 0.2s; animation: rowIn 0.2s ease;
  }
  .seq-row:hover { border-color: #f97316; }
  @keyframes rowIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

  .seq-idx { font-size: 0.62rem; color: ${dark ? "#4b5563" : "#9ca3af"}; min-width: 16px; }
  .seq-name { flex: 1; }
  .seq-actions { display: flex; gap: 4px; }
  .seq-btn {
    background: transparent;
    border: 1px solid ${dark ? "#2a2a3e" : "#dddbd5"};
    color: ${dark ? "#6b7280" : "#9ca3af"};
    border-radius: 5px; padding: 2px 7px; cursor: pointer;
    font-size: 0.67rem; font-family: 'JetBrains Mono', monospace; transition: all 0.15s;
  }
  .seq-btn:hover     { border-color: #f97316; color: #f97316; }
  .seq-btn-del:hover { border-color: #ef4444; color: #ef4444; }

  .row-arrow {
    font-family: 'JetBrains Mono', monospace; font-size: 0.63rem;
    color: ${dark ? "#2a2a3e" : "#c0bdb5"}; padding: 1px 0 1px 4px;
  }
`;

const Canvas = ({ sequence, setSequence, dark }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "NODE",
    drop: (item) => setSequence((prev) => [...prev, { ...item, id: uuidv4() }]),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const remove = (id) => setSequence((prev) => prev.filter((n) => n.id !== id));
  const moveUp = (idx) => { if (idx === 0) return; setSequence((prev) => { const a = [...prev];[a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; }); };
  const moveDown = (idx) => setSequence((prev) => { if (idx === prev.length - 1) return prev; const a = [...prev];[a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a; });

  const isEmpty = sequence.length === 0;

  return (
    <>
      <style>{getCanvasStyles(dark)}</style>
      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* START NODE */}
        <div className="flow-node flow-node-start">
          <span className="node-dot dot-green" />
          start
        </div>

        <div className="v-line v-line-short" />

        {/* DROP RAIL */}
        <div className={`drop-rail ${isOver ? "over" : ""}`}>
          <div ref={drop} className={`drop-inner ${isOver ? "over" : ""}`}>

            {isEmpty && (
              <div className={`drop-placeholder ${isOver ? "over" : ""}`}>
                {isOver ? "↓ drop here" : "drag nodes here…"}
              </div>
            )}

            {sequence.map((n, idx) => (
              <React.Fragment key={n.id}>
                {idx > 0 && <div className="row-arrow">↓</div>}

                <div className="seq-row">
                  <span className="seq-idx">{idx + 1}</span>
                  <span className="seq-name">{n.name}</span>

                  <div className="seq-actions">
                    <button className="seq-btn" onClick={() => moveUp(idx)}>↑</button>
                    <button className="seq-btn" onClick={() => moveDown(idx)}>↓</button>
                    <button className="seq-btn seq-btn-del" onClick={() => remove(n.id)}>✕</button>
                  </div>
                </div>

              </React.Fragment>
            ))}

          </div>
        </div>

        <div className="v-line v-line-short" />

        {/* OUTPUT NODE */}
        <div className="flow-node flow-node-end">
          <span className="node-dot dot-indigo" />
          output
        </div>

      </div>
    </>
  );
};

export default Canvas;