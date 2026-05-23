import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { interviewAPI, analyticsAPI } from '../services/api'
import { Trophy, TrendingUp, AlertTriangle, BookOpen, Target, RotateCcw, Home, ChevronRight } from 'lucide-react'

function ScoreGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <div className="text-center p-4 rounded-xl" style={{ background: '#0F1117', border: '1px solid #1E2536' }}>
      <div className="text-3xl font-display font-bold mb-1" style={{ color }}>{Math.round(value)}%</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [repRes, qRes] = await Promise.all([
          interviewAPI.getReport(parseInt(sessionId!)),
          analyticsAPI.getQuestions(parseInt(sessionId!)),
        ])
        setReport(repRes.data.report_data)
        setQuestions(qRes.data)
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [sessionId])

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-primary font-display text-sm">GENERATING REPORT...</p>
      </div>
    </div>
  )

  if (!report) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-slate-400">Report not available yet</p>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    </div>
  )

  const overall = report.overall_score || 0
  const verdict = report.final_verdict || ''
  const verdictColor = overall >= 70 ? '#10B981' : overall >= 40 ? '#F59E0B' : '#EF4444'

  // Radar data
  const radarData = [
    { subject: 'AI/ML', A: report.ai_ml_readiness || 0 },
    { subject: 'GenAI', A: report.genai_readiness || 0 },
    { subject: 'Coding', A: report.coding_readiness || 0 },
    { subject: 'Communication', A: report.communication_score || 0 },
    { subject: 'Technical', A: report.technical_score || 0 },
    { subject: 'Resume', A: report.resume_strength_score || 0 },
  ]

  // Bar data
  const barData = questions.map((q, i) => ({ name: `Q${i + 1}`, score: Math.round(q.score || 0), type: q.question_type }))

  return (
    // <div className="min-h-screen grid-bg pb-20">
    <div className="min-h-screen grid-bg pb-20 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b" style={{ borderColor: '#1E2536' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
  className="font-display text-lg font-bold tracking-[0.25em]"
  style={{
    color: '#00D4FF',
    textShadow: '0 0 18px rgba(0,212,255,.35)'
  }}
>INTERVIEW REPORT</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/config')} className="btn-ghost flex items-center gap-2 py-2 px-4 text-xs">
              <RotateCcw className="w-3 h-3" />New Interview
            </button>
            <button onClick={() => navigate('/')} className="btn-ghost flex items-center gap-2 py-2 px-4 text-xs">
              <Home className="w-3 h-3" />Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Hero Score */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${verdictColor}, transparent 60%)` }} />
          <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: verdictColor }} />
          <div className="text-6xl font-display font-black mb-2" style={{ color: verdictColor }}>{Math.round(overall)}%</div>
          <p className="text-xl text-white font-semibold mb-3">Overall Score</p>
          <div className="inline-block px-6 py-2 rounded-full text-sm font-bold" style={{ background: `${verdictColor}22`, border: `1px solid ${verdictColor}44`, color: verdictColor }}>
            Hiring Probability: {Math.round(report.hiring_probability || 0)}%
          </div>
          {verdict && <p className="text-slate-400 text-sm mt-4 max-w-xl mx-auto">{verdict}</p>}
        </motion.div>

        {/* Score Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <ScoreGauge value={report.technical_score || 0} label="Technical" />
          <ScoreGauge value={report.ai_ml_readiness || 0} label="AI/ML" />
          <ScoreGauge value={report.genai_readiness || 0} label="GenAI" />
          <ScoreGauge value={report.coding_readiness || 0} label="Coding" />
          <ScoreGauge value={report.communication_score || 0} label="Communication" />
          <ScoreGauge value={report.resume_strength_score || 0} label="Resume" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-xs text-primary mb-4">SKILL RADAR</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E2536" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
                <Radar name="Score" dataKey="A" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-xs text-primary mb-4">QUESTION SCORES</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#161B27', border: '1px solid #1E2536', borderRadius: '8px' }} labelStyle={{ color: '#94A3B8' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.score >= 70 ? '#10B981' : d.score >= 40 ? '#F59E0B' : '#EF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-emerald-400" /><h3 className="font-display text-xs text-emerald-400">STRONG AREAS</h3></div>
            <ul className="space-y-2">
              {(report.strong_areas || []).map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <ChevronRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-amber-400" /><h3 className="font-display text-xs text-amber-400">WEAK AREAS</h3></div>
            <ul className="space-y-2">
              {(report.weak_areas || []).map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Learning Path */}
        {(report.recommended_learning_path || report.improvement_roadmap || []).length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-purple-400" /><h3 className="font-display text-xs text-purple-400">RECOMMENDED LEARNING PATH</h3></div>
            <div className="grid md:grid-cols-2 gap-2">
              {(report.recommended_learning_path || report.improvement_roadmap || []).map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-xs text-slate-300" style={{ background: '#7C3AED11', border: '1px solid #7C3AED22' }}>
                  <span className="font-display text-purple-400">{String(i + 1).padStart(2, '0')}.</span>{s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question-wise Detail */}
        {questions.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary" /><h3 className="font-display text-xs text-primary">QUESTION-WISE ANALYSIS</h3></div>
            <div className="space-y-3">
              {questions.map((q: any, i: number) => {
                const s = q.score || 0; const color = s >= 70 ? '#10B981' : s >= 40 ? '#F59E0B' : '#EF4444'
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: '#0F1117', border: '1px solid #1E2536' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-sm font-bold flex-shrink-0" style={{ background: `${color}22`, color }}>{Math.round(s)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{q.question_text}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{q.question_type} · {q.difficulty}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ background: q.passed ? '#10B98122' : '#EF444422', color: q.passed ? '#10B981' : '#EF4444' }}>
                      {q.passed ? '✓ Pass' : '✗ Fail'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}