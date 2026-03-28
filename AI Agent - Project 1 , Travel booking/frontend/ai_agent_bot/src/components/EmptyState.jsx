/* ═══════════════════════════════════════════════════════════
   components/EmptyState.jsx
   Re-usable empty / error state illustration.
   ═══════════════════════════════════════════════════════════ */
import React from 'react'
import '../styles/EmptyState.css'

export default function EmptyState({ icon = '📭', title, description, action, onAction }) {
  return (
    <div className="es-wrap">
      <div className="es-icon">{icon}</div>
      {title       && <div className="es-title">{title}</div>}
      {description && <div className="es-desc">{description}</div>}
      {action && onAction && (
        <button className="es-action-btn" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}