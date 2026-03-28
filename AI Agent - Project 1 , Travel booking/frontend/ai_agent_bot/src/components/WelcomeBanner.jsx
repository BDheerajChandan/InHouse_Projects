/* ═══════════════════════════════════════════════════════════
   components/WelcomeBanner.jsx
   Shown inside chat area when only the welcome message exists.
   Displays capability cards as quick-action shortcuts.
   ═══════════════════════════════════════════════════════════ */
import React from 'react'
import '../styles/WelcomeBanner.css'

const CAPABILITIES = [
  {
    icon: '🎫',
    title: 'Book a Ticket',
    desc: 'Train, bus, flight, car or bike — just say it naturally.',
    example: 'Book a train from BBSR to VSKP',
    color: '#388bfd',
  },
  {
    icon: '📋',
    title: 'View History',
    desc: 'See all your past bookings, filter by vehicle or date.',
    example: 'Show me all flight bookings',
    color: '#39d0d8',
  },
  {
    icon: '✏️',
    title: 'Update Booking',
    desc: 'Change destination, date, or status of any booking.',
    example: 'Update booking #2 destination to Kolkata',
    color: '#e3b341',
  },
  {
    icon: '🗑️',
    title: 'Cancel Booking',
    desc: 'Cancel a booking by its ID instantly.',
    example: 'Cancel booking #5',
    color: '#f85149',
  },
]

export default function WelcomeBanner({ onPrompt }) {
  return (
    <div className="wb-wrap">
      <div className="wb-hero">
        <div className="wb-hero-icon">✦</div>
        <h1 className="wb-hero-title">AI Travel Booking Agent</h1>
        <p className="wb-hero-sub">
          Powered by LLM · Understand natural language · Book instantly
        </p>
      </div>

      <div className="wb-grid">
        {CAPABILITIES.map((cap, i) => (
          <button
            key={i}
            className="wb-card"
            style={{ '--cap-color': cap.color }}
            onClick={() => onPrompt(cap.example)}
            title={`Try: ${cap.example}`}
          >
            <div className="wb-card__icon">{cap.icon}</div>
            <div className="wb-card__body">
              <div className="wb-card__title">{cap.title}</div>
              <div className="wb-card__desc">{cap.desc}</div>
              <div className="wb-card__example">
                <span className="wb-card__example-label">Try:</span>
                <span className="wb-card__example-text">{cap.example}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}