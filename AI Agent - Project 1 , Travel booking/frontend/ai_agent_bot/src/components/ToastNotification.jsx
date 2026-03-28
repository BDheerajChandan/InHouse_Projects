/* ═══════════════════════════════════════════════════════════
   components/ToastNotification.jsx
   Lightweight toast stack — no external library needed.
   Usage: const { toasts, toast } = useToasts()
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useCallback, useEffect } from 'react'
import '../styles/ToastNotification.css'

/* ── Hook ────────────────────────────────────────────────────── */
export function useToasts() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return { toasts, toast }
}

/* ── Component ───────────────────────────────────────────────── */
export default function ToastNotification({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className="toast-stack" aria-live="assertive" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">
            {t.type === 'success' && '✅'}
            {t.type === 'error'   && '⚠️'}
            {t.type === 'info'    && 'ℹ️'}
          </span>
          <span className="toast__message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}