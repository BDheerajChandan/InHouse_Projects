// /* ═══════════════════════════════════════════════════════════
//    services/chatStore.js
//    Central store — constants, formatters, useChat hook.

//    Key features:
//    - AbortController: user can cancel a slow LLM request
//    - Retry: re-send the last message on failure
//    - Timeout error message: tells user what went wrong
//    ═══════════════════════════════════════════════════════════ */
// import { useState, useCallback, useRef, useEffect } from 'react'
// import { chatWithAgent, healthCheck } from './Api.js'

// /* ── Vehicle metadata ────────────────────────────────────────── */
// export const VEHICLES = ['train', 'bus', 'flight', 'car', 'bike']

// export const VEHICLE_META = {
//   train:  { icon: '🚆', color: '#388bfd', label: 'Train'  },
//   bus:    { icon: '🚌', color: '#e3b341', label: 'Bus'    },
//   flight: { icon: '✈️',  color: '#39d0d8', label: 'Flight' },
//   car:    { icon: '🚗', color: '#3dd68c', label: 'Car'    },
//   bike:   { icon: '🏍️', color: '#f85149', label: 'Bike'   },
// }

// /* ── Tool metadata ───────────────────────────────────────────── */
// export const TOOL_META = {
//   create_booking:          { label: 'Booking Created',  icon: '✅', color: '#3dd68c' },
//   get_travel_history:      { label: 'Travel History',   icon: '📋', color: '#388bfd' },
//   delete_booking:          { label: 'Booking Deleted',  icon: '🗑️', color: '#f85149' },
//   update_booking:          { label: 'Booking Updated',  icon: '✏️', color: '#e3b341' },
//   update_booking_by_id:    { label: 'Booking Updated',  icon: '✏️', color: '#e3b341' },
//   update_booking_by_query: { label: 'Booking Updated',  icon: '✏️', color: '#e3b341' },
//   chitchat:                { label: 'Agent',            icon: '💬', color: '#94a3b8' },
// }

// /* ── Quick prompts ───────────────────────────────────────────── */
// export const QUICK_PROMPTS = [
//   { text: 'Book a train from BBSR to VSKP',                          icon: '🚆' },
//   { text: 'Book a flight from Delhi to Mumbai',                      icon: '✈️' },
//   { text: 'Book a bus from Hyderabad to Bangalore',                  icon: '🚌' },
//   { text: 'Book a car from Chennai to Pondicherry',                  icon: '🚗' },
//   { text: 'Show me my travel history',                               icon: '📋' },
//   { text: 'Show me all train bookings',                              icon: '🔍' },
//   { text: 'Show history between 2025-01-01 and 2025-12-31',         icon: '📅' },
//   { text: 'Cancel booking #1',                                       icon: '🗑️' },
// ]

// /* ── Welcome message ─────────────────────────────────────────── */
// export const WELCOME_MESSAGE = {
//   id:        '__welcome__',
//   role:      'agent',
//   type:      'welcome',
//   text:      `Hello! I'm your **AI Travel Booking Agent** ✈️\n\nI understand natural language:\n\n- 🚆 *"Book a train from BBSR to VSKP on 25 March 2026"*\n- ✈️ *"Book train and flight from VSKP to BBSR on 25 March"*\n- 📋 *"Show me all my bookings"*\n- ✏️ *"Update train from BBSR to VSKP on 25 March to 27 March"*\n- 🗑️ *"Cancel booking #3"*`,
//   timestamp: new Date(),
// }

// /* ── Formatters ──────────────────────────────────────────────── */
// export function formatDate(str) {
//   if (!str) return '—'
//   try {
//     return new Date(str).toLocaleDateString('en-IN', {
//       day: '2-digit', month: 'short', year: 'numeric',
//     })
//   } catch { return str }
// }

// export function formatDateTime(str) {
//   if (!str) return '—'
//   try {
//     return new Date(str).toLocaleString('en-IN', {
//       day: '2-digit', month: 'short', year: 'numeric',
//       hour: '2-digit', minute: '2-digit',
//     })
//   } catch { return str }
// }

// export function formatTime(date) {
//   if (!(date instanceof Date)) return ''
//   return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
// }

// export function capitalize(str = '') {
//   return str.charAt(0).toUpperCase() + str.slice(1)
// }

// export function genId() {
//   return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
// }

// /* ── useChat hook ────────────────────────────────────────────── */
// export function useChat() {
//   const [messages,  setMessages]  = useState([WELCOME_MESSAGE])
//   const [loading,   setLoading]   = useState(false)
//   const [backendOk, setBackendOk] = useState(null)

//   // AbortController ref — allows cancel of in-flight request
//   const abortRef   = useRef(null)
//   const mountedRef = useRef(true)

//   // Last sent message — for retry
//   const lastMsgRef = useRef('')

//   /* health check on mount */
//   useEffect(() => {
//     healthCheck()
//       .then(()  => { if (mountedRef.current) setBackendOk(true)  })
//       .catch(()  => { if (mountedRef.current) setBackendOk(false) })
//     return () => { mountedRef.current = false }
//   }, [])

//   const push = useCallback((msg) => {
//     setMessages(prev => [...prev, { id: genId(), timestamp: new Date(), ...msg }])
//   }, [])

//   /* ── Send message ─────────────────────────────────────────── */
//   const send = useCallback(async (text) => {
//     const trimmed = text.trim()
//     if (!trimmed || loading) return

//     lastMsgRef.current = trimmed
//     push({ role: 'user', text: trimmed })
//     setLoading(true)

//     // Create abort controller for this request
//     abortRef.current = new AbortController()

//     try {
//       const data = await chatWithAgent(trimmed, abortRef.current.signal)
//       push({
//         role:    'agent',
//         type:    data.tool_called,
//         text:    data.message,
//         payload: data,
//       })
//     } catch (err) {
//       // Don't show error bubble if user cancelled
//       if (err.message === 'Request cancelled.') return

//       const isTimeout = err.message.includes('timed out') || err.message.includes('timeout')
//       push({
//         role: 'agent',
//         type: 'error',
//         text: isTimeout
//           ? `⏱️ **Request timed out.**\n\nThe AI took too long to respond. This usually means:\n- Your OpenAI API key has slow response times\n- The model (gpt-3.5-turbo) is under load\n\n**Try:** Click *Retry* below, or switch to Gemini in your .env file.`
//           : `⚠️ **Error:** ${err.message}`,
//         canRetry: true,
//         retryText: trimmed,
//       })
//     } finally {
//       setLoading(false)
//       abortRef.current = null
//     }
//   }, [loading, push])

//   /* ── Cancel in-flight request ─────────────────────────────── */
//   const cancel = useCallback(() => {
//     if (abortRef.current) {
//       abortRef.current.abort()
//       abortRef.current = null
//       setLoading(false)
//       push({
//         role: 'agent',
//         type: 'error',
//         text: '⏹️ Request cancelled.',
//       })
//     }
//   }, [push])

//   /* ── Retry last message ───────────────────────────────────── */
//   const retry = useCallback(() => {
//     if (lastMsgRef.current) {
//       send(lastMsgRef.current)
//     }
//   }, [send])

//   /* ── Clear chat ───────────────────────────────────────────── */
//   const clearChat = useCallback(() => {
//     if (abortRef.current) {
//       abortRef.current.abort()
//       abortRef.current = null
//     }
//     setLoading(false)
//     setMessages([WELCOME_MESSAGE])
//   }, [])

//   return { messages, loading, backendOk, send, cancel, retry, clearChat }
// }

/* ═══════════════════════════════════════════════════════════
   services/chatStore.js
   Central store — constants, formatters, useChat hook.

   Key features:
   - AbortController: user can cancel a slow LLM request
   - Retry: re-send the last message on failure
   - Timeout error message: tells user what went wrong
   ═══════════════════════════════════════════════════════════ */
import { useState, useCallback, useRef, useEffect } from 'react'
import { chatWithAgent, healthCheck } from './Api.js'

/* ── Vehicle metadata ────────────────────────────────────────── */
export const VEHICLES = ['train', 'bus', 'flight', 'car', 'bike']

export const VEHICLE_META = {
  train:  { icon: '🚆', color: '#388bfd', label: 'Train'  },
  bus:    { icon: '🚌', color: '#e3b341', label: 'Bus'    },
  flight: { icon: '✈️',  color: '#39d0d8', label: 'Flight' },
  car:    { icon: '🚗', color: '#3dd68c', label: 'Car'    },
  bike:   { icon: '🏍️', color: '#f85149', label: 'Bike'   },
}

/* ── Tool metadata ───────────────────────────────────────────── */
export const TOOL_META = {
  create_booking:          { label: 'Booking Created',  icon: '✅', color: '#3dd68c' },
  get_travel_history:      { label: 'Travel History',   icon: '📋', color: '#388bfd' },
  delete_booking:          { label: 'Booking Deleted',  icon: '🗑️', color: '#f85149' },
  update_booking:          { label: 'Booking Updated',  icon: '✏️', color: '#e3b341' },
  update_booking_by_id:    { label: 'Booking Updated',  icon: '✏️', color: '#e3b341' },
  update_booking_by_query: { label: 'Booking Updated',  icon: '✏️', color: '#e3b341' },
  create_multi_booking:   { label: 'Bookings Created', icon: '✅', color: '#3dd68c' },
  chitchat:                { label: 'Agent',            icon: '💬', color: '#94a3b8' },
}

/* ── Quick prompts ───────────────────────────────────────────── */
export const QUICK_PROMPTS = [
  { text: 'Book a train from BBSR to VSKP',                          icon: '🚆' },
  { text: 'Book a flight from Delhi to Mumbai',                      icon: '✈️' },
  { text: 'Book a bus from Hyderabad to Bangalore',                  icon: '🚌' },
  { text: 'Book a car from Chennai to Pondicherry',                  icon: '🚗' },
  { text: 'Show me my travel history',                               icon: '📋' },
  { text: 'Show me all train bookings',                              icon: '🔍' },
  { text: 'Show history between 2025-01-01 and 2025-12-31',         icon: '📅' },
  { text: 'Cancel booking #1',                                       icon: '🗑️' },
]

/* ── Welcome message ─────────────────────────────────────────── */
export const WELCOME_MESSAGE = {
  id:        '__welcome__',
  role:      'agent',
  type:      'welcome',
  text:      `Hello! I'm your **AI Travel Booking Agent** ✈️\n\nI understand natural language:\n\n- 🚆 *"Book a train from BBSR to VSKP on 25 March 2026"*\n- ✈️ *"Book train and flight from VSKP to BBSR on 25 March"*\n- 📋 *"Show me all my bookings"*\n- ✏️ *"Update train from BBSR to VSKP on 25 March to 27 March"*\n- 🗑️ *"Cancel booking #3"*`,
  timestamp: new Date(),
}

/* ── Formatters ──────────────────────────────────────────────── */
export function formatDate(str) {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return str }
}

export function formatDateTime(str) {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return str }
}

export function formatTime(date) {
  if (!(date instanceof Date)) return ''
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/* ── useChat hook ────────────────────────────────────────────── */
export function useChat() {
  const [messages,  setMessages]  = useState([WELCOME_MESSAGE])
  const [loading,   setLoading]   = useState(false)
  const [backendOk, setBackendOk] = useState(null)

  // AbortController ref — allows cancel of in-flight request
  const abortRef   = useRef(null)
  const mountedRef = useRef(true)

  // Last sent message — for retry
  const lastMsgRef = useRef('')

  /* health check on mount */
  useEffect(() => {
    healthCheck()
      .then(()  => { if (mountedRef.current) setBackendOk(true)  })
      .catch(()  => { if (mountedRef.current) setBackendOk(false) })
    return () => { mountedRef.current = false }
  }, [])

  const push = useCallback((msg) => {
    setMessages(prev => [...prev, { id: genId(), timestamp: new Date(), ...msg }])
  }, [])

  /* ── Send message ─────────────────────────────────────────── */
  const send = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    lastMsgRef.current = trimmed
    push({ role: 'user', text: trimmed })
    setLoading(true)

    // Create abort controller for this request
    abortRef.current = new AbortController()

    try {
      const data = await chatWithAgent(trimmed, abortRef.current.signal)
      push({
        role:    'agent',
        type:    data.tool_called,
        text:    data.message,
        payload: data,
      })
    } catch (err) {
      // Don't show error bubble if user cancelled
      if (err.message === 'Request cancelled.') return

      const isTimeout = err.message.includes('timed out') || err.message.includes('timeout')
      push({
        role: 'agent',
        type: 'error',
        text: isTimeout
          ? `⏱️ **Request timed out.**\n\nThe AI took too long to respond. This usually means:\n- Your OpenAI API key has slow response times\n- The model (gpt-3.5-turbo) is under load\n\n**Try:** Click *Retry* below, or switch to Gemini in your .env file.`
          : `⚠️ **Error:** ${err.message}`,
        canRetry: true,
        retryText: trimmed,
      })
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [loading, push])

  /* ── Cancel in-flight request ─────────────────────────────── */
  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
      setLoading(false)
      push({
        role: 'agent',
        type: 'error',
        text: '⏹️ Request cancelled.',
      })
    }
  }, [push])

  /* ── Retry last message ───────────────────────────────────── */
  const retry = useCallback(() => {
    if (lastMsgRef.current) {
      send(lastMsgRef.current)
    }
  }, [send])

  /* ── Clear chat ───────────────────────────────────────────── */
  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setLoading(false)
    setMessages([WELCOME_MESSAGE])
  }, [])

  return { messages, loading, backendOk, send, cancel, retry, clearChat }
}