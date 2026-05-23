import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import { interviewAPI, voiceAPI, WS_URL } from '../services/api'

// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-0.5" style={{ height: 28 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`wv-bar ${active ? '' : 'off'}`}
          style={{ height: active ? `${12 + Math.random() * 14}px` : '6px', transition: 'height 0.12s' }} />
      ))}
    </div>
  )
}

// ── AI Avatar ─────────────────────────────────────────────────────────────────
function AIAvatar({ speaking, personality }: { speaking: boolean; personality: string }) {
  const palettes: Record<string, { stroke: string; glow: string }> = {
    'Friendly':            { stroke: '#22D3EE', glow: 'rgba(34,211,238,.28)' },
    'Strict':              { stroke: '#F87171', glow: 'rgba(248,113,113,.28)' },
    'FAANG Interviewer':   { stroke: '#A78BFA', glow: 'rgba(167,139,250,.28)' },
    'Technical Architect': { stroke: '#FBBF24', glow: 'rgba(251,191,36,.28)' },
    'HR Interviewer':      { stroke: '#34D399', glow: 'rgba(52,211,153,.28)' },
  }
  const pal = palettes[personality] ?? palettes['Friendly']

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div className="relative flex items-center justify-center"
        style={{ width: 88, height: 88 }}>
        {speaking && <>
          <div className="pulse-ring" style={{ color: pal.stroke }} />
          <div className="pulse-ring pulse-ring-2" style={{ color: pal.stroke }} />
        </>}
        <div className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 80, height: 80,
            background: `radial-gradient(circle, ${pal.stroke}14, transparent 70%)`,
            border: `1.5px solid ${pal.stroke}40`,
            boxShadow: speaking ? `0 0 28px ${pal.glow}` : 'none',
            transition: 'box-shadow .3s',
          }}>
          {/* Hexagon AI face */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 3L36 12V28L20 37L4 28V12L20 3Z"
              stroke={pal.stroke} strokeWidth="1.2" fill={`${pal.stroke}08`}/>
            <circle cx="14" cy="17" r="2" fill={pal.stroke} opacity=".9"/>
            <circle cx="26" cy="17" r="2" fill={pal.stroke} opacity=".9"/>
            <path d="M14 24 Q20 28 26 24" stroke={pal.stroke} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: pal.stroke }}>AI Interviewer</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{personality}</p>
      </div>

      {/* Speaking waveform */}
      <div style={{ opacity: speaking ? 1 : 0.2, transition: 'opacity .3s' }}>
        <Waveform active={speaking} />
      </div>
    </div>
  )
}

// ── Score Donut ───────────────────────────────────────────────────────────────
function ScoreDonut({ value, color }: { value: number; color: string }) {
  const r = 32; const c = 2 * Math.PI * r
  const offset = c - (Math.min(value, 100) / 100) * c
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--c-border)" strokeWidth="6" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { config, setSession, addAnswer } = useAppStore()

  const [question, setQuestion]       = useState<any>(null)
  const [answer, setAnswer]           = useState('')
  const [liveText, setLiveText]       = useState('')   // partial speech text
  const [evaluation, setEvaluation]   = useState<any>(null)
  const [liveScore, setLiveScore]     = useState<number | null>(null)
  const [loading, setLoading]         = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [speaking, setSpeaking]       = useState(false)
  const [recording, setRecording]     = useState(false)
  const [timeLeft, setTimeLeft]       = useState(config.totalTime * 60)
  const [qTime, setQTime]             = useState(0)
  const [qNum, setQNum]               = useState(0)
  const [ended, setEnded]             = useState(false)

  const mediaRef   = useRef<MediaRecorder | null>(null)
  const chunksRef  = useRef<Blob[]>([])
  const wsRef      = useRef<WebSocket | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval>>()
  const qTimerRef  = useRef<ReturnType<typeof setInterval>>()

  const sid = parseInt(sessionId || '0')
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/interview/${sid}`)
    wsRef.current = ws
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'live_score') setLiveScore(msg.score ?? null)
        if (msg.type === 'transcription') {
          if (msg.is_final) {
            setAnswer(prev => (prev + ' ' + msg.text).trim())
            setLiveText('')
          } else {
            setLiveText(msg.text || '')
          }
        }
      } catch {}
    }
    ws.onerror = () => {}
    return () => { try { ws.close() } catch {} wsRef.current = null }
  }, [sid])

  // ── Global timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); handleEnd(); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // ── Per-question timer ────────────────────────────────────────────────────
  useEffect(() => {
    setQTime(0)
    clearInterval(qTimerRef.current)
    qTimerRef.current = setInterval(() => setQTime(t => t + 1), 1000)
    return () => clearInterval(qTimerRef.current)
  }, [question?.question_id])

  // Load first question
  useEffect(() => { loadNext() }, [])

  // ── Load next question ────────────────────────────────────────────────────
  const loadNext = async () => {
    setLoading(true); setEvaluation(null); setAnswer(''); setLiveText(''); setLiveScore(null)
    try {
      const res = await interviewAPI.nextQuestion(sid)
      if (res.data.completed) { handleEnd(); return }
      setQuestion(res.data)
      setQNum(res.data.question_number)
      if (res.data.audio_url) {
        const audio = new Audio(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${res.data.audio_url}`)
        setSpeaking(true)
        audio.onended = () => setSpeaking(false)
        audio.onerror = () => setSpeaking(false)
        audio.play().catch(() => setSpeaking(false))
      }
    } catch { toast.error('Failed to load question') }
    finally { setLoading(false) }
  }

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setLiveText('Transcribing...')
        try {
          const res = await voiceAPI.stt(blob, config.sarvamLanguage)
          const text = res.data.transcript || ''
          if (text) {
            setAnswer(prev => (prev + ' ' + text).trim())
            setLiveText('')
            // Send to WS for live eval
            wsRef.current?.send(JSON.stringify({
              type: 'live_evaluate',
              question,
              answer: text,
              config: { company_name: config.companyName },
              llm_provider: config.selectedLLM,
            }))
          } else {
            setLiveText('')
            toast('No speech detected', { icon: '🎙️' })
          }
        } catch { setLiveText('') }
      }
      mr.start(250)
      mediaRef.current = mr
      setRecording(true)
    } catch { toast.error('Microphone access denied') }
  }

  const stopRecording = () => {
    try { mediaRef.current?.stop() } catch {}
    mediaRef.current = null
    setRecording(false)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const combined = (answer + ' ' + liveText).trim()
    if (!combined) return toast.error('Please provide an answer')
    setSubmitting(true)
    try {
      const res = await interviewAPI.submitAnswer({
        session_id: sid, question_id: question.question_id,
        answer_text: combined, time_taken: qTime,
      })
      setEvaluation(res.data)
      setAnswer(combined)
      setLiveText('')
      addAnswer({ ...question, ...res.data, answer_text: combined })
    } catch { toast.error('Failed to evaluate answer') }
    finally { setSubmitting(false) }
  }

  // ── End ───────────────────────────────────────────────────────────────────
  const handleEnd = async () => {
    if (ended) return; setEnded(true)
    clearInterval(timerRef.current); clearInterval(qTimerRef.current)
    try {
      const res = await interviewAPI.endInterview(sid)
      setSession({ status: 'completed', overallScore: res.data.overall_score })
    } catch {}
    toast.success('Interview complete!')
    navigate(`/report/${sid}`)
  }

  const scoreColor = (s: number) => s >= 70 ? 'var(--c-green)' : s >= 40 ? 'var(--c-amber)' : 'var(--c-red)'
  const displayScore = evaluation?.score ?? liveScore

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading && !question) return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--c-cyan)', borderTopColor: 'transparent' }} />
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--c-cyan)' }}>Generating Question...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-grid flex flex-col" style={{ fontFamily: 'var(--f-body)' }}>

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-3 sticky top-0 z-20"
        style={{ background: 'rgba(8,11,16,.92)', borderBottom: '1px solid var(--c-border)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <span className="font-display text-sm font-bold" style={{ color: 'var(--c-cyan)' }}>{config.companyName || 'Interview'}</span>
          <span className="pill pill-dim">{config.difficulty}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="section-label">Q {qNum}/{config.numQuestions}</span>
          <div className="prog-track w-28">
            <div className="prog-fill" style={{ width: `${(qNum / config.numQuestions) * 100}%` }} />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: timeLeft < 300 ? 'rgba(248,113,113,.08)' : 'var(--c-surface)', border: `1px solid ${timeLeft < 300 ? 'rgba(248,113,113,.3)' : 'var(--c-border)'}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: timeLeft < 300 ? 'var(--c-red)' : 'var(--c-green)', boxShadow: `0 0 6px currentColor` }} />
            <span className="font-mono text-sm font-semibold" style={{ color: timeLeft < 300 ? 'var(--c-red)' : 'var(--c-text)' }}>{fmt(timeLeft)}</span>
          </div>
          <button onClick={handleEnd} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}>
            End Interview
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 max-w-[1400px] mx-auto w-full">

        {/* ── LEFT: AI Interviewer ── */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="card p-5 flex flex-col items-center gap-2">
            <AIAvatar speaking={speaking} personality={config.aiPersonality} />

            {question && (
              <div className="w-full mt-3 space-y-2 pt-3" style={{ borderTop: '1px solid var(--c-border)' }}>
                <Row label="Type"       value={question.question_type}  />
                <Row label="Difficulty" value={question.difficulty}     color={question.difficulty === 'Hard' || question.difficulty === 'FAANG' ? 'var(--c-red)' : question.difficulty === 'Easy' ? 'var(--c-green)' : 'var(--c-amber)'} />
                <Row label="Time"       value={fmt(qTime)} mono />
                <Row label="Company"    value={question.company_style || config.companyName} />
              </div>
            )}
          </div>

          {/* Expected concepts */}
          {question?.expected_keywords?.length > 0 && (
            <div className="card p-4">
              <p className="section-label mb-3">Key Concepts</p>
              <div className="flex flex-wrap gap-1.5">
                {question.expected_keywords.map((kw: string) => (
                  <span key={kw} className="pill pill-dim text-xs">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Q time */}
          <div className="card p-4">
            <p className="section-label mb-1">Question Time</p>
            <p className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-cyan)' }}>{fmt(qTime)}</p>
          </div>
        </div>

        {/* ── CENTER: Question + Answer ── */}
        <div className="col-span-6 flex flex-col gap-4">

          {/* Question card */}
          <AnimatePresence mode="wait">
            {question && (
              <motion.div key={question.question_id}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded"
                    style={{ background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.2)', color: 'var(--c-violet)' }}>
                    Q{question.question_number}
                  </span>
                  <span className="section-label">{question.company_style || config.companyName}</span>
                  {speaking && (
                    <span className="flex items-center gap-1.5 ml-auto text-xs" style={{ color: 'var(--c-cyan)' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--c-cyan)' }} />
                      Speaking
                    </span>
                  )}
                </div>
                <p className="text-base leading-relaxed" style={{ color: 'var(--c-text)', lineHeight: 1.75 }}>
                  {question.question_text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Answer area ── */}
          <div className="card p-5 flex-1 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="section-label">Your Answer</p>
              <div className="flex items-center gap-3">
                {recording && (
                  <div className="flex items-center gap-2">
                    <Waveform active={true} />
                    <span className="font-mono text-xs animate-pulse" style={{ color: 'var(--c-red)' }}>● REC</span>
                  </div>
                )}
                {liveText === 'Transcribing...' && (
                  <span className="text-xs" style={{ color: 'var(--c-muted)' }}>Transcribing...</span>
                )}
              </div>
            </div>

            {/* Transcript display */}
            <div className="flex-1 rounded-lg p-4 min-h-[140px] relative"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              {answer || liveText ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text)' }}>
                  {answer}
                  {liveText && liveText !== 'Transcribing...' && (
                    <span style={{ color: 'var(--c-muted)' }}>
                      {answer ? ' ' : ''}{liveText}
                      {recording && <span className="transcript-live" />}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
                  {evaluation
                    ? 'Answer submitted.'
                    : 'Click Record to speak, or type your answer below...'}
                </p>
              )}
              {/* Edit textarea overlay if not evaluated */}
              {!evaluation && (
                <textarea
                  value={answer}
                  onChange={e => {
                    setAnswer(e.target.value)
                    if (e.target.value.length > 30) {
                      wsRef.current?.send(JSON.stringify({
                        type: 'live_evaluate', question,
                        answer: e.target.value,
                        config: { company_name: config.companyName },
                        llm_provider: config.selectedLLM,
                      }))
                    }
                  }}
                  disabled={!!evaluation}
                  placeholder="Or type your answer here..."
                  className="absolute inset-0 w-full h-full rounded-lg p-4 text-sm resize-none outline-none opacity-0 focus:opacity-100"
                  style={{
                    background: 'var(--c-surface)',
                    border: '1px solid var(--c-cyan)',
                    color: 'var(--c-text)',
                    fontFamily: 'var(--f-body)',
                    lineHeight: 1.7,
                    transition: 'opacity .2s',
                  }}
                />
              )}
            </div>

            {/* Type hint */}
            {!evaluation && (
              <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
                💡 Click in the answer box to type · or use the Record button for voice
              </p>
            )}

            {/* Controls */}
            {!evaluation ? (
              <div className="flex gap-2">
                <button onClick={recording ? stopRecording : startRecording}
                  className={`btn ${recording ? 'btn-danger' : 'btn-cyan'} flex-shrink-0`}
                  style={{ minWidth: 110 }}>
                  {recording
                    ? <><StopIcon /> Stop</>
                    : <><MicIcon /> Record</>}
                </button>
                <button onClick={() => loadNext()} className="btn btn-ghost flex-shrink-0" disabled={loading}>
                  <SkipIcon /> Skip
                </button>
                <button onClick={handleSubmit}
                  disabled={submitting || (!answer.trim() && !liveText.trim())}
                  className="btn btn-primary flex-1">
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <><SendIcon /> Submit Answer</>}
                </button>
              </div>
            ) : (
              <button onClick={loadNext} disabled={loading} className="btn btn-primary w-full">
                {loading
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : 'Next Question →'}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live Analytics ── */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* Live score donut */}
          <div className="card p-5">
            <p className="section-label mb-4">Live Score</p>
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <ScoreDonut
                  value={displayScore ?? 0}
                  color={displayScore != null ? scoreColor(displayScore) : 'var(--c-border2)'}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-bold"
                    style={{ color: displayScore != null ? scoreColor(displayScore) : 'var(--c-muted)' }}>
                    {displayScore != null ? Math.round(displayScore) : '—'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--c-muted)' }}>/ 100</span>
                </div>
              </div>
              {evaluation && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg mt-1 ${evaluation.passed ? 'fb-good' : 'fb-miss'}`}>
                  {evaluation.passed ? '✓ PASSED' : '✗ NEEDS IMPROVEMENT'}
                </div>
              )}
              {!evaluation && displayScore != null && (
                <p className="text-xs mt-1" style={{ color: 'var(--c-muted)' }}>Live estimate</p>
              )}
            </div>
          </div>

          {/* Score breakdown */}
          <AnimatePresence>
            {evaluation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-3">
                <p className="section-label">Breakdown</p>
                <Meter label="Technical Depth"  value={evaluation.technical_depth     || 0} color="var(--c-cyan)"   />
                <Meter label="Communication"    value={evaluation.communication_score || 0} color="var(--c-violet)" />
                <Meter label="Confidence"       value={evaluation.confidence_score    || 0} color="var(--c-green)"  />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {evaluation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-2">
                <p className="section-label mb-2">Feedback</p>

                {evaluation.good_points?.slice(0, 2).map((p: string, i: number) => (
                  <div key={i} className="fb-good flex gap-2">
                    <span className="flex-shrink-0">✓</span><span>{p}</span>
                  </div>
                ))}
                {evaluation.weak_points?.slice(0, 2).map((p: string, i: number) => (
                  <div key={i} className="fb-warn flex gap-2">
                    <span className="flex-shrink-0">⚠</span><span>{p}</span>
                  </div>
                ))}
                {evaluation.missing_keywords?.length > 0 && (
                  <div className="fb-miss">
                    <p className="font-semibold mb-1">Missing keywords</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evaluation.missing_keywords.slice(0, 5).map((k: string) => (
                        <span key={k} className="pill pill-red text-xs">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {evaluation.next_difficulty && (
                  <div className="flex items-center gap-2 pt-2 mt-1" style={{ borderTop: '1px solid var(--c-border)' }}>
                    <span className="text-xs" style={{ color: 'var(--c-muted)' }}>Next:</span>
                    <span className="pill pill-amber">{evaluation.next_difficulty}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Improvements */}
          <AnimatePresence>
            {evaluation?.improvements?.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
                <p className="section-label mb-3">How to Improve</p>
                <ul className="space-y-2">
                  {evaluation.improvements.slice(0, 3).map((tip: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--c-muted)' }}>
                      <span style={{ color: 'var(--c-violet)', flexShrink: 0 }}>{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── Small helpers ── */
function Row({ label, value, color, mono }: any) {
  return (
    <div className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--c-border)' }}>
      <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{label}</span>
      <span className={`text-xs font-medium ${mono ? 'font-mono' : ''}`} style={{ color: color || 'var(--c-text)' }}>{value || '—'}</span>
    </div>
  )
}
function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--c-muted)' }}>{label}</span>
        <span style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}
function MicIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg> }
function StopIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> }
function SendIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> }
function SkipIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg> }