import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsAPI, interviewAPI } from '../services/api'
import { useAppStore } from '../store/appStore'
import {
  Brain, Plus, LogOut, Trophy, TrendingUp, Clock, Target,
  ChevronRight, Zap, BarChart3, Star, Building2
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold mt-1" style={{ color }}>{value}</p>
          {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, clearAuth, resetSession } = useAppStore()
  const [stats, setStats] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => { setStats(r.data.stats); setRecent(r.data.recent_sessions || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleNewInterview = () => { resetSession(); navigate('/config') }
  const handleLogout = () => { clearAuth(); navigate('/login') }

  const chartData = [...recent].reverse().map((s, i) => ({
    name: `#${i + 1}`, score: Math.round(s.overall_score || 0),
  }))

  const diffColor: any = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444', FAANG: '#7C3AED', 'Research Level': '#00D4FF' }

  return (
    <div className="min-h-screen grid-bg">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-6 gap-6 z-20" style={{ background: '#0F1117', borderRight: '1px solid #1E2536' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-cyan" style={{ background: 'linear-gradient(135deg, #00D4FF, #7C3AED)' }}>
          <Brain className="w-5 h-5 text-slate-900" />
        </div>
        <div className="flex-1" />
        <button onClick={handleLogout} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-950" style={{ border: '1px solid #1E2536' }}>
          <LogOut className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Main */}
      <div className="ml-16 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-glow" style={{ color: '#00D4FF' }}>NEURO INTERVIEW</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, <span className="text-slate-300">{user?.username || 'Candidate'}</span></p>
          </div>
          <button onClick={handleNewInterview} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Interview
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Trophy} label="Total Interviews" value={stats?.total_sessions || 0} color="#00D4FF" sub="All time" />
          <StatCard icon={TrendingUp} label="Avg Score" value={`${Math.round(stats?.avg_score || 0)}%`} color="#7C3AED" sub="Performance" />
          <StatCard icon={Star} label="Best Score" value={`${Math.round(stats?.best_score || 0)}%`} color="#F59E0B" sub="Personal best" />
          <StatCard icon={Zap} label="AI Engine" value="GPT-4o" color="#10B981" sub="Active model" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="md:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-display text-xs text-primary">SCORE TREND</h3>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#161B27', border: '1px solid #1E2536', borderRadius: '8px', fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center gap-3">
                <Brain className="w-10 h-10 text-slate-700" />
                <p className="text-xs text-slate-600">No interview data yet</p>
                <button onClick={handleNewInterview} className="text-xs text-primary hover:underline">Start your first interview →</button>
              </div>
            )}
          </div>

          {/* Quick Start */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h3 className="font-display text-xs text-yellow-400">QUICK START</h3>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { company: 'Google', diff: 'FAANG', tech: 'DSA + System Design' },
                { company: 'OpenAI', diff: 'Hard', tech: 'LLM + RAG + Transformers' },
                { company: 'Infosys', diff: 'Medium', tech: 'Python + SQL + ML' },
                { company: 'TCS', diff: 'Easy', tech: 'Core CS + Communication' },
              ].map((t, i) => (
                <button key={i} onClick={handleNewInterview}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all hover:border-cyan-800"
                  style={{ background: '#0F1117', border: '1px solid #1E2536' }}>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{t.company}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{t.tech}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${diffColor[t.diff]}22`, color: diffColor[t.diff] }}>{t.diff}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleNewInterview} className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-3">
              <Plus className="w-4 h-4" /> Custom Interview
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        {recent.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-display text-xs text-primary">RECENT INTERVIEWS</h3>
            </div>
            <div className="space-y-2">
              {recent.map((s: any) => {
                const score = Math.round(s.overall_score || 0)
                const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
                return (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:border-slate-600"
                    style={{ background: '#0F1117', border: '1px solid #1E2536' }}
                    onClick={() => navigate(`/report/${s.id}`)}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                      <Building2 className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium">{s.company_name || 'General'}</p>
                      <p className="text-xs text-slate-600">{s.difficulty} · {new Date(s.start_time).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-bold" style={{ color }}>{score}%</p>
                      <p className="text-xs text-slate-600">{s.num_questions}Q</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 mt-8">
          {[
            { label: 'Sarvam AI Voice', color: '#00D4FF' },
            { label: 'LangGraph Workflow', color: '#7C3AED' },
            { label: 'Real-time Evaluation', color: '#10B981' },
            { label: 'Resume Intelligence', color: '#F59E0B' },
            { label: 'Multi-LLM Support', color: '#EF4444' },
            { label: 'Company-style Questions', color: '#00D4FF' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: `${color}11`, border: `1px solid ${color}33`, color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}