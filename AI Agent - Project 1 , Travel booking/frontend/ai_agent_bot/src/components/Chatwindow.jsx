/* ═══════════════════════════════════════════════════════════
   components/ChatWindow.jsx
   Scrollable message list with auto-scroll-to-bottom.
   ═══════════════════════════════════════════════════════════ */
import React, { useEffect, useRef, useState } from 'react'
import MessageBubble   from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import '../styles/ChatWindow.css'

export default function ChatWindow({ messages, loading }) {
  const bottomRef   = useRef(null)
  const containerRef = useRef(null)
  const [showScroll, setShowScroll] = useState(false)

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  /* ── Show "scroll to bottom" button when user scrolls up ── */
  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScroll(distFromBottom > 120)
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="cw-outer">
      <div
        className="cw-messages"
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {/* Date separator for first message */}
        <div className="cw-date-sep">
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* Scroll-to-bottom FAB */}
      {showScroll && (
        <button
          className="cw-scroll-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to latest message"
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}
    </div>
  )
}