// Messagebubble.jsx
/* ═══════════════════════════════════════════════════════════
   components/MessageBubble.jsx
   Renders user / agent bubbles, booking cards, history tables.
   ═══════════════════════════════════════════════════════════ */
import React from 'react'
import {
  VEHICLE_META, TOOL_META,
  formatDate, formatDateTime, formatTime, capitalize
} from '../services/chatStore.js'
import '../styles/MessageBubble.css'

/* ── Inline markdown renderer ────────────────────────────────── */
function InlineMarkdown({ text }) {
  return (
    <div className="md-body">
      {text.split('\n').map((line, i) => {
        if (!line) return <div key={i} className="md-blank" />

        // Parse inline **bold** and *italic*
        const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
        const rendered = tokens.map((tok, j) => {
          if (tok.startsWith('**') && tok.endsWith('**'))
            return <strong key={j}>{tok.slice(2, -2)}</strong>
          if (tok.startsWith('*')  && tok.endsWith('*'))
            return <em key={j}>{tok.slice(1, -1)}</em>
          return tok
        })

        // List items
        if (line.startsWith('- '))
          return (
            <div key={i} className="md-li">
              <span className="md-li-bullet">▸</span>
              <span>{rendered.slice(1)}</span>
            </div>
          )

        return <p key={i} className="md-p">{rendered}</p>
      })}
    </div>
  )
}

/* ── Booking confirmation card ───────────────────────────────── */
function BookingCard({ booking }) {
  if (!booking) return null
  const meta = VEHICLE_META[booking.vehicle] || { icon: '🎫', color: '#388bfd', label: booking.vehicle }

  return (
    <div className="bk-card" style={{ '--bk-accent': meta.color }}>
      {/* header */}
      <div className="bk-card__head">
        <span className="bk-card__icon">{meta.icon}</span>
        <span className="bk-card__vehicle">{meta.label} Booking</span>
        {booking.id && (
          <span className="bk-card__id">#{booking.id}</span>
        )}
        <span className="bk-card__status">confirmed</span>
      </div>

      {/* route */}
      <div className="bk-card__route">
        <div className="bk-card__node">
          <span className="bk-card__node-label">FROM</span>
          <span className="bk-card__node-city">{(booking.from || booking['from'] || '—').toUpperCase()}</span>
        </div>
        <div className="bk-card__rail">
          <div className="bk-card__rail-line" />
          <span className="bk-card__rail-icon">{meta.icon}</span>
          <div className="bk-card__rail-line" />
        </div>
        <div className="bk-card__node bk-card__node--right">
          <span className="bk-card__node-label">TO</span>
          <span className="bk-card__node-city">{(booking.to || booking['to'] || '—').toUpperCase()}</span>
        </div>
      </div>

      {/* date */}
      {booking.travel_date && (
        <div className="bk-card__footer">
          <span>📅</span>
          <span>{formatDate(booking.travel_date)}</span>
        </div>
      )}
    </div>
  )
}

/* ── Travel history table ────────────────────────────────────── */
function HistoryTable({ records }) {
  if (!records || records.length === 0) return null

  return (
    <div className="ht-wrap">
      <div className="ht-header">
        <span className="ht-header__title">📋 Travel History</span>
        <span className="ht-header__count">{records.length} record{records.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="ht-scroll">
        <table className="ht-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>From</th>
              <th>To</th>
              <th>Travel Date</th>
              <th>Booked At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const meta = VEHICLE_META[r.vehicle] || { icon: '🎫', label: r.vehicle }
              return (
                <tr key={r.id ?? i} className="ht-table__row">
                  <td className="ht-td--id">#{r.id}</td>
                  <td>
                    <span className="ht-vehicle-tag">
                      {meta.icon} {capitalize(r.vehicle)}
                    </span>
                  </td>
                  <td className="ht-td--city">{(r.from || r['from'] || '—').toUpperCase()}</td>
                  <td className="ht-td--city">{(r.to   || r['to']   || '—').toUpperCase()}</td>
                  <td className="ht-td--date">{formatDate(r.travel_date)}</td>
                  <td className="ht-td--date">{formatDateTime(r.booked_at)}</td>
                  <td>
                    <span className={`ht-badge ht-badge--${r.status || 'confirmed'}`}>
                      {r.status || 'confirmed'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main MessageBubble ──────────────────────────────────────── */
export default function MessageBubble({ message }) {
  const { role, text, type, payload, timestamp } = message
  const isUser  = role === 'user'
  const toolInfo = TOOL_META[type] || null

  return (
    <div className={`msg-wrap ${isUser ? 'msg-wrap--user' : 'msg-wrap--agent'}`}>

      {/* Agent avatar */}
      {!isUser && (
        <div className="msg-avatar msg-avatar--agent" aria-hidden>
          <span>✦</span>
        </div>
      )}

      <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--agent'}`}>

        {/* Tool badge */}
        {!isUser && toolInfo && type !== 'welcome' && type !== 'error' && (
          <div className="msg-tool-badge" style={{ '--tool-color': toolInfo.color }}>
            <span>{toolInfo.icon}</span>
            <span>{toolInfo.label}</span>
          </div>
        )}

        {/* Text */}
        <div className="msg-text">
          {isUser
            ? <span>{text}</span>
            : <InlineMarkdown text={text} />
          }
        </div>

        {/* Booking card */}
        {payload?.booking && <BookingCard booking={payload.booking} />}

        {/* History table */}
        {payload?.records && payload.records.length > 0 && (
          <HistoryTable records={payload.records} />
        )}

        {/* Empty history */}
        {payload?.records && payload.records.length === 0 && (
          <div className="msg-empty">
            <span>📭</span>
            <span>No records found for the given filters.</span>
          </div>
        )}

        {/* Timestamp */}
        <div className="msg-time">{formatTime(timestamp)}</div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="msg-avatar msg-avatar--user" aria-hidden>U</div>
      )}
    </div>
  )
}