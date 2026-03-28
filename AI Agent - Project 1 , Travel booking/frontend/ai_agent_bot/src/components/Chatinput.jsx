/* ═══════════════════════════════════════════════════════════
   components/ChatInput.jsx
   - Auto-resize textarea
   - Enter to send, Shift+Enter for newline
   - Cancel button while loading (stops stuck requests)
   - Rotating placeholder text
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react'
import '../styles/ChatInput.css'

const PLACEHOLDERS = [
  'Book a train from BBSR to VSKP on 25 March 2026…',
  'Show me all my travel bookings…',
  'Book a flight from Delhi to Mumbai tomorrow…',
  'Update train from BBSR to VSKP to 27 March…',
  'Cancel booking #3…',
  'Show train bookings between Jan and June…',
]

export default function ChatInput({ onSend, onCancel, loading, disabled }) {
  const [value,       setValue]      = useState('')
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0])
  const textareaRef = useRef(null)
  const phIdxRef    = useRef(0)

  /* Rotate placeholder when idle */
  useEffect(() => {
    const id = setInterval(() => {
      phIdxRef.current = (phIdxRef.current + 1) % PLACEHOLDERS.length
      setPlaceholder(PLACEHOLDERS[phIdxRef.current])
    }, 3500)
    return () => clearInterval(id)
  }, [])

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  const canSend = value.trim().length > 0 && !loading && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ci-outer">
      <div className={`ci-wrap ${loading ? 'ci-wrap--loading' : ''} ${value ? 'ci-wrap--active' : ''}`}>

        {/* Animated glow bar at top */}
        <div className="ci-glow-bar" />

        <div className="ci-inner">
          {/* Decorative mic icon */}
          <div className="ci-decorations">
            <span className="ci-deco-icon">🎙</span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="ci-textarea"
            placeholder={loading ? 'AI is thinking…' : placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            rows={1}
            aria-label="Message to AI booking agent"
            autoComplete="off"
            spellCheck="true"
          />

          {/* Cancel button — shown while loading */}
          {loading && (
            <button
              className="ci-cancel-btn"
              onClick={onCancel}
              title="Cancel request"
              aria-label="Cancel"
            >
              <span className="ci-cancel-icon">✕</span>
              <span className="ci-cancel-label">Stop</span>
            </button>
          )}

          {/* Send button — shown when not loading */}
          {!loading && (
            <button
              className={`ci-send-btn ${canSend ? 'ci-send-btn--ready' : ''}`}
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              title="Send (Enter)"
            >
              <svg
                className="ci-send-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>

        {/* Status / hints row */}
        <div className="ci-hints">
          {loading ? (
            <>
              <span className="ci-spinner" />
              <span className="ci-hint-sep ci-hint-loading">
                AI is processing your request…
              </span>
              <span className="ci-hint-dot">·</span>
              <span className="ci-hint-sep" style={{ color: 'var(--clr-accent-red)', cursor: 'pointer' }} onClick={onCancel}>
                Click Stop to cancel
              </span>
            </>
          ) : (
            <>
              <span className="ci-hint-key">↵ Enter</span>
              <span className="ci-hint-sep">to send</span>
              <span className="ci-hint-dot">·</span>
              <span className="ci-hint-key">⇧ Shift+Enter</span>
              <span className="ci-hint-sep">new line</span>
              {value.length > 0 && (
                <>
                  <span className="ci-hint-dot">·</span>
                  <span className="ci-hint-chars">{value.length} chars</span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}