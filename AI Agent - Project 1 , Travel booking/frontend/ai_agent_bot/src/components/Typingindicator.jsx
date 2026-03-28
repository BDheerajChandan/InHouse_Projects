// Typingindicator.jsx
/* ═══════════════════════════════════════════════════════════
   components/TypingIndicator.jsx
   ═══════════════════════════════════════════════════════════ */
import React from 'react'
import '../styles/TypingIndicator.css'

export default function TypingIndicator() {
  return (
    <div className="typing-wrap" aria-live="polite" aria-label="Agent is thinking">
      <div className="typing-avatar">✦</div>
      <div className="typing-bubble">
        <span className="typing-label">Thinking</span>
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}