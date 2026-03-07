// src/components/Node.jsx

import React from "react";
import { useDrag } from "react-dnd";

const getNodeStyles = (dark) => `
  .palette-node {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px;
    background: ${dark ? "#13131f" : "#fff"};
    border: 1px solid ${dark ? "#2a2a3e" : "#dddbd5"};
    border-radius: 8px; font-family: 'JetBrains Mono', monospace;
    font-size: 0.76rem; color: ${dark ? "#d1d5db" : "#374151"};
    cursor: grab; transition: all 0.18s; user-select: none;
  }
  .palette-node:hover {
    border-color: #f97316;
    background: ${dark ? "#1a1408" : "#fff8f1"};
    color: #fb923c;
    transform: translateX(2px);
  }
  .palette-node.dragging { opacity: 0.35; cursor: grabbing; transform: none; }
  .palette-node-grip { color: ${dark ? "#374151" : "#c0bdb5"}; font-size: 0.72rem; letter-spacing: -1px; }
`;

const Node = ({ node, dark, type = "NODE" }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id: node.id, name: node.name },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <>
      <style>{getNodeStyles(dark)}</style>
      <div ref={drag} className={`palette-node ${isDragging ? "dragging" : ""}`}>
        <span className="palette-node-grip">⠿</span>
        {node.name}
      </div>
    </>
  );
};

export default Node;