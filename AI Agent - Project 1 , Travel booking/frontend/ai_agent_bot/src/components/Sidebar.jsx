// Sidebar.jsx
/* ═══════════════════════════════════════════════════════════
   components/Sidebar.jsx
   ═══════════════════════════════════════════════════════════ */
import React from 'react'
import { VEHICLES, VEHICLE_META, QUICK_PROMPTS } from '../services/chatStore.js'
import '../styles/Sidebar.css'

export default function Sidebar({ onPrompt, onClose, isMobile }) {
  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <span>✈</span>
        </div>
        <div className="sidebar__logo-text">
          <div className="sidebar__logo-title">TravelAI</div>
          <div className="sidebar__logo-sub">Booking Agent v2.0</div>
        </div>
        {isMobile && (
          <button className="sidebar__close-btn" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        )}
      </div>

      {/* ── Backend status ── */}
      <div className="sidebar__status-row">
        <span className="sidebar__status-dot sidebar__status-dot--green" />
        <span className="sidebar__status-label">Agent Online</span>
      </div>

      {/* ── Vehicles ── */}
      <section className="sidebar__section">
        <div className="sidebar__section-label">Supported Vehicles</div>
        <div className="sidebar__vehicles">
          {VEHICLES.map(v => {
            const m = VEHICLE_META[v]
            return (
              <button
                key={v}
                className="sidebar__vehicle-chip"
                style={{ '--chip-color': m.color }}
                onClick={() => onPrompt(`Book a ${v} ticket`)}
                title={`Quick book a ${v}`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Quick Prompts ── */}
      <section className="sidebar__section sidebar__section--grow">
        <div className="sidebar__section-label">Quick Prompts</div>
        <div className="sidebar__prompts">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              className="sidebar__prompt-btn"
              onClick={() => onPrompt(p.text)}
              title={p.text}
            >
              <span className="sidebar__prompt-icon">{p.icon}</span>
              <span className="sidebar__prompt-text">{p.text}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Stack info ── */}
      <div className="sidebar__footer">
        <div className="sidebar__stack-item">
          <span className="sidebar__stack-dot" style={{ background: '#3dd68c' }} />
          FastAPI + Uvicorn
        </div>
        <div className="sidebar__stack-item">
          <span className="sidebar__stack-dot" style={{ background: '#388bfd' }} />
          LLM Agent (Gemini / OpenAI)
        </div>
        <div className="sidebar__stack-item">
          <span className="sidebar__stack-dot" style={{ background: '#e3b341' }} />
          SQLite — Booking.db
        </div>
        <div className="sidebar__stack-item">
          <span className="sidebar__stack-dot" style={{ background: '#39d0d8' }} />
          React + Vite
        </div>
      </div>
    </aside>
  )
}