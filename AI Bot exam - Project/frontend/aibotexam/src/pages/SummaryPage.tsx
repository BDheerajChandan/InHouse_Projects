import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import { interviewAPI } from '../services/api'
import { Brain, Rocket, Building2, Target, Clock, List, User, Star, AlertTriangle, Eye } from 'lucide-react'

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start justify-between py-2" style={{ borderBottom: '1px solid #1E253644' }}>
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-xs text-slate-200 font-medium text-right max-w-xs">{Array.isArray(value) ? value.join(', ') || '—' : value || '—'}</span>
    </div>
  )
}

function Card({ icon: Icon, title, color, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color }} />
        <h3 className="font-display text-xs font-bold tracking-wider" style={{ color }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export default function SummaryPage() {
  const navigate = useNavigate()
  const { config, configId, resume, setSession } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!configId) return toast.error('Configuration missing — go back to Step 1')
    setLoading(true)
    try {
      const res = await interviewAPI.createSession(configId, resume.id || undefined)
      const { session_id, session_token, strategy } = res.data
      setSession({ id: session_id, token: session_token, configId, strategy, status: 'pending', currentQuestionIndex: 0, answers: [] })
      await interviewAPI.startSession(session_id)
      toast.success('Interview session created!')
      navigate(`/interview/${session_id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to start interview')
    } finally { setLoading(false) }
  }

  return (
    // <div className="min-h-screen grid-bg pb-20">
    // <div className="min-h-screen grid-bg pb-20 relative overflow-hidden">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
      <div className="sticky top-0 z-10 glass-card border-b" style={{ borderColor: '#1E2536' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1
  className="font-display text-lg font-bold tracking-[0.25em]"
  style={{
    color: '#00D4FF',
    textShadow: '0 0 18px rgba(0,212,255,.35)'
  }}
>INTERVIEW BRIEF</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-1 w-8 rounded-full" style={{ background: i <= 3 ? 'linear-gradient(90deg, #00D4FF, #7C3AED)' : '#1E2536' }} />
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-500">Step 3 of 4</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 50% 0%, #00D4FF, transparent 60%)' }} />
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center glow-cyan" style={{ background: 'linear-gradient(135deg, #00D4FF22, #7C3AED22)', border: '1px solid #00D4FF44' }}>
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-glow" style={{ color: '#00D4FF' }}>{config.companyName || 'General'}</h2>
          <p className="text-slate-400 text-sm mt-1">{config.difficulty} · {config.experienceLevel} · {config.aiPersonality} Interviewer</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl font-display font-bold text-white">{config.numQuestions}</p>
              <p className="text-xs text-slate-500">Questions</p>
            </div>
            <div className="w-px h-10" style={{ background: '#1E2536' }} />
            <div className="text-center">
              <p className="text-xl font-display font-bold text-white">{config.totalTime}m</p>
              <p className="text-xs text-slate-500">Duration</p>
            </div>
            <div className="w-px h-10" style={{ background: '#1E2536' }} />
            <div className="text-center">
              <p className="text-xl font-display font-bold text-white">{config.selfValidationCutoff}%</p>
              <p className="text-xs text-slate-500">Pass Mark</p>
            </div>
          </div>
        </motion.div>

        {/* Config Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card icon={Settings2Fallback} title="CONFIGURATION" color="#00D4FF">
            <InfoRow label="Technologies" value={config.technologies} />
            <InfoRow label="Experience" value={config.experienceLevel} />
            <InfoRow label="Mode" value={config.interviewMode} />
            <InfoRow label="LLM Engine" value={config.selectedLLM.toUpperCase()} />
            <InfoRow label="Sarvam Language" value={config.sarvamLanguage} />
          </Card>
          <Card icon={List} title="QUESTION TYPES" color="#7C3AED">
            <div className="flex flex-wrap gap-2">
              {(config.questionTypes.length ? config.questionTypes : ['Auto']).map(t => (
                <span key={t} className="px-2 py-1 rounded-md text-xs" style={{ background: '#7C3AED22', border: '1px solid #7C3AED44', color: '#A855F7' }}>{t}</span>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              <InfoRow label="Primary Skills" value={config.primarySkills} />
              <InfoRow label="Secondary Skills" value={config.secondarySkills} />
            </div>
          </Card>
        </div>

        {/* Resume Summary */}
        {resume.id && resume.ats_score > 0 && (
          <Card icon={User} title="RESUME INTELLIGENCE" color="#10B981">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'ATS', val: resume.ats_score, color: '#00D4FF' },
                { label: 'AI', val: resume.ai_readiness_score, color: '#7C3AED' },
                { label: 'ML', val: resume.ml_readiness_score, color: '#10B981' },
                { label: 'GenAI', val: resume.genai_readiness_score, color: '#F59E0B' },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center p-2 rounded-lg" style={{ background: '#0F1117', border: '1px solid #1E2536' }}>
                  <p className="text-lg font-display font-bold" style={{ color }}>{Math.round(val)}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1 mb-2"><Star className="w-3 h-3 text-emerald-400" /><span className="text-xs text-emerald-400 font-semibold">Strong</span></div>
                <div className="flex flex-wrap gap-1">
                  {resume.strong_areas.slice(0,5).map(s => <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ background: '#10B98122', color: '#10B981' }}>{s}</span>)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2"><AlertTriangle className="w-3 h-3 text-amber-400" /><span className="text-xs text-amber-400 font-semibold">Weak</span></div>
                <div className="flex flex-wrap gap-1">
                  {resume.weak_areas.slice(0,5).map(s => <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ background: '#F59E0B22', color: '#F59E0B' }}>{s}</span>)}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* What AI knows */}
        <Card icon={Eye} title="WHAT THE AI INTERVIEWER KNOWS ABOUT YOU" color="#F59E0B">
          <div className="space-y-2 text-xs text-slate-400">
            <p>• <span className="text-white">Technologies:</span> {config.technologies.slice(0,5).join(', ') || 'General'}</p>
            <p>• <span className="text-white">Experience:</span> {config.experienceLevel}</p>
            <p>• <span className="text-white">Target Role:</span> {config.companyName} ({config.difficulty} level)</p>
            {resume.id ? (
              <>
                <p>• <span className="text-white">Resume Strengths:</span> {resume.strong_areas.slice(0,3).join(', ')}</p>
                <p>• <span className="text-white">Focus Areas:</span> {resume.weak_areas.slice(0,3).join(', ')}</p>
              </>
            ) : (
              <p>• <span className="text-slate-500">No resume provided — questions will be based on configuration only</span></p>
            )}
            <p>• <span className="text-white">Personality:</span> {config.aiPersonality} interviewer tone</p>
            <p>• <span className="text-white">Language:</span> Sarvam AI — {config.sarvamLanguage}</p>
          </div>
        </Card>

        {/* CTA */}
        <div className="flex gap-4">
          <button onClick={() => navigate('/resume')} className="btn-ghost">← Back</button>
          <button onClick={handleStart} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-3 py-4 text-base">
            {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
              <><Rocket className="w-5 h-5" /><span>LAUNCH INTERVIEW</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Inline fallback icon
function Settings2Fallback({ className, style }: any) {
  return <Target className={className} style={style} />
}