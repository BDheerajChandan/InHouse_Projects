// Header.jsx

/* ═══════════════════════════════════════════════════════════
   components/Header.jsx
   ═══════════════════════════════════════════════════════════ */
import React from 'react'
import '../styles/Header.css'

export default function Header({ sidebarOpen, onToggleSidebar, onClearChat, backendOk }) {
  return (
    <header className="header">
      {/* ── Left cluster ── */}
      <div className="header__left">
        <button
          className="header__toggle-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className={`header__hamburger ${sidebarOpen ? 'header__hamburger--open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>

        <div className="header__brand">
          <div className="header__brand-name">
            AI Booking Agent
          </div>
          <div className="header__brand-sub">
            LLM · FastAPI · SQLite · React
          </div>
        </div>
      </div>

      {/* ── Center status ── */}
      <div className="header__center">
        <div className={`header__backend-pill ${backendOk === false ? 'header__backend-pill--err' : ''}`}>
          <span className="header__backend-dot" />
          <span>
            {backendOk === null  && 'Connecting…'}
            {backendOk === true  && 'Backend Online'}
            {backendOk === false && 'Backend Offline'}
          </span>
        </div>
      </div>

      {/* ── Right actions ── */}
      <div className="header__right">
        <button
          className="header__action-btn header__action-btn--danger"
          onClick={onClearChat}
          title="Clear chat"
        >
          <span className="header__action-icon">⌫</span>
          <span className="header__action-label">Clear</span>
        </button>
      </div>
    </header>
  )
}