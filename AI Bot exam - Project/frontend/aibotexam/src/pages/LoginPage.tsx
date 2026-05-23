import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAppStore } from '../store/appStore'
import { Brain, Zap, Lock, Mail, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAppStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res: any
      if (mode === 'login') {
        res = await authAPI.login(form.email, form.password)
      } else {
        res = await authAPI.register(form)
      }
      setAuth(res.data.access_token, { id: res.data.user_id, email: res.data.email, username: res.data.username })
      toast.success(`Welcome${mode === 'register' ? ', ' + form.username : ' back'}!`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-cyan" style={{ background: 'linear-gradient(135deg, #00D4FF22, #7C3AED22)', border: '1px solid #00D4FF44' }}>
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-glow" style={{ color: '#00D4FF' }}>NEURO INTERVIEW</h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise AI Interview Simulator</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: '#0F1117', border: '1px solid #1E2536' }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all duration-200"
                style={mode === m ? { background: 'linear-gradient(135deg, #00D4FF, #7C3AED)', color: '#0F1117' } : { color: '#64748B' }}>
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className="input-field pl-10" placeholder="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className="input-field pl-10" placeholder="Full Name (optional)" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input-field pl-10" type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input-field pl-10" type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
                <><span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">Powered by GPT-4, Claude, Gemini & Sarvam AI voice</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}