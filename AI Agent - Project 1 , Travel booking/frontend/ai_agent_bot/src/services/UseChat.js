// Usechat.js

import { useState, useCallback, useRef } from 'react'
import { sendMessage } from '../services/Api'

/**
 * useChat – manages conversation state, loading, and error handling.
 */
export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'agent',
      text: "Hello! I'm your **AI Travel Booking Agent** 🤖\n\nI can help you:\n- 🎫 **Book** train, bus, flight, car, or bike tickets\n- 📋 **View** your travel history\n- ✏️ **Update** or **cancel** bookings\n\nJust type naturally — e.g. *\"Book a train from BBSR to VSKP\"*",
      timestamp: new Date(),
      type: 'welcome',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }])
  }, [])

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return

    // User bubble
    addMessage({ role: 'user', text: text.trim(), timestamp: new Date() })
    setLoading(true)
    setError(null)

    try {
      const data = await sendMessage(text.trim())

      addMessage({
        role: 'agent',
        text: data.message,
        timestamp: new Date(),
        type: data.tool_called,
        payload: data,
      })
    } catch (err) {
      const errMsg = err?.response?.data?.detail || err.message || 'Something went wrong.'
      setError(errMsg)
      addMessage({
        role: 'agent',
        text: `⚠️ **Error:** ${errMsg}`,
        timestamp: new Date(),
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [loading, addMessage])

  const clearChat = useCallback(() => {
    setMessages(prev => prev.filter(m => m.id === 'welcome'))
    setError(null)
  }, [])

  return { messages, loading, error, send, clearChat }
}