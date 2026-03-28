/* ═══════════════════════════════════════════════════════════
   App.jsx  —  Root component.
   Wires sidebar, header, chat window, input, toasts.
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react'

import Sidebar             from './components/Sidebar.jsx'
import Header              from './components/Header.jsx'
import ChatWindow          from './components/ChatWindow.jsx'
import ChatInput           from './components/ChatInput.jsx'
import WelcomeBanner       from './components/WelcomeBanner.jsx'
import ToastNotification, { useToasts } from './components/ToastNotification.jsx'

import { useChat }         from './services/chatStore.js'
import './App.css'

export default function App() {
  const { messages, loading, backendOk, send, cancel, retry, clearChat } = useChat()
  const { toasts, toast } = useToasts()

  /* ── Sidebar open/close ── */
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile,    setIsMobile]    = useState(false)

  /* ── Detect mobile ── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = (e) => {
      setIsMobile(e.matches)
      if (e.matches) setSidebarOpen(false)
    }
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  /* ── Backend status toast ── */
  useEffect(() => {
    if (backendOk === false) {
      toast({ message: 'Backend offline — start the FastAPI server.', type: 'error', duration: 5000 })
    }
    if (backendOk === true) {
      toast({ message: 'Connected to backend ✓', type: 'success', duration: 2500 })
    }
  }, [backendOk]) // eslint-disable-line

  /* ── Handle send (also fires toast on booking success) ── */
  const handleSend = useCallback(async (text) => {
    await send(text)
  }, [send])

  /* ── Quick prompt from sidebar / banner ── */
  const handleQuickPrompt = useCallback((text) => {
    if (isMobile) setSidebarOpen(false)
    handleSend(text)
  }, [isMobile, handleSend])

  /* ── Clear chat ── */
  const handleClear = useCallback(() => {
    clearChat()
    toast({ message: 'Chat cleared.', type: 'info', duration: 2000 })
  }, [clearChat, toast])

  /* ── Toggle sidebar ── */
  const toggleSidebar = () => setSidebarOpen(v => !v)

  /* ── Only welcome message → show banner inside chat ── */
  const showBanner = messages.length === 1 && messages[0].id === '__welcome__'

  return (
    <div className="app-shell">

      {/* ── Ambient background ── */}
      <div className="app-ambient" aria-hidden>
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
        <div className="ambient-grid" />
      </div>

      {/* ── Sidebar backdrop on mobile ── */}
      {isMobile && sidebarOpen && (
        <div
          className="app-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`app-sidebar-wrap ${sidebarOpen ? '' : 'collapsed'}`}>
        <Sidebar
          onPrompt={handleQuickPrompt}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* ── Main content ── */}
      <main className="app-main">

        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onClearChat={handleClear}
          backendOk={backendOk}
        />

        {/* Welcome banner (only shown before first real message) */}
        {showBanner ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <WelcomeBanner onPrompt={handleQuickPrompt} />
          </div>
        ) : (
          <ChatWindow messages={messages} loading={loading} />
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onCancel={cancel}
          loading={loading}
          disabled={backendOk === false}
        />
      </main>

      {/* ── Mobile FAB to open sidebar ── */}
      {isMobile && !sidebarOpen && (
        <button
          className="app-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          ☰
        </button>
      )}

      {/* ── Toasts ── */}
      <ToastNotification toasts={toasts} />
    </div>
  )
}