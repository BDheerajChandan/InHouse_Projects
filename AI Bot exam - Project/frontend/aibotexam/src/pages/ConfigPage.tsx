import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import { interviewAPI } from '../services/api'
import { Settings2, ChevronRight, X, Plus, Brain, Building2, Mic, Video, Sliders } from 'lucide-react'

const TECH_OPTIONS = ['Python','SQL','AI','Machine Learning','Deep Learning','NLP','Generative AI','LangChain','LangGraph','FastAPI','Django','TensorFlow','PyTorch','Computer Vision','Data Science','Transformers','CNN','RNN','OpenCV','MLOps','LLM','RAG','Vector Database']
const Q_TYPES = ['Coding','Theory','Project-based','Resume-based','Scenario-based','SQL','Architecture','System Design','Debugging','AI/ML','GenAI','Deep Learning','Behavioral','HR']
const COMPANIES = ['Google','Microsoft','Amazon','OpenAI','NVIDIA','Meta','Apple','Netflix','IBM','Oracle','Infosys','TCS','Wipro','Deloitte','Accenture','Capgemini','Cognizant','CSM Technologies']
const PERSONALITIES = ['Friendly','Strict','FAANG Interviewer','Technical Architect','HR Interviewer']
const LLMS = [{ value: 'openai', label: 'GPT-4o' }, { value: 'claude', label: 'Claude 3.5' }, { value: 'gemini', label: 'Gemini Pro' }, { value: 'groq', label: 'Groq Llama3' }]
const LANGUAGES = [{ value: 'en-IN', label: 'English (India)' },{ value: 'hi-IN', label: 'Hindi' },{ value: 'ta-IN', label: 'Tamil' },{ value: 'te-IN', label: 'Telugu' },{ value: 'kn-IN', label: 'Kannada' },{ value: 'ml-IN', label: 'Malayalam' },{ value: 'mr-IN', label: 'Marathi' },{ value: 'bn-IN', label: 'Bengali' },{ value: 'gu-IN', label: 'Gujarati' },{ value: 'od-IN', label: 'Odia' }]

function MultiSelect({ options, selected, onChange, label }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = selected.includes(opt)
          return (
            <button key={opt} type="button" onClick={() => onChange(isSelected ? selected.filter((s: string) => s !== opt) : [...selected, opt])}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={isSelected ? { background: 'linear-gradient(135deg, #00D4FF22, #7C3AED22)', border: '1px solid #00D4FF66', color: '#00D4FF' } : { background: '#0F1117', border: '1px solid #1E2536', color: '#64748B' }}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TagInput({ value, onChange, placeholder, label }: any) {
  const [input, setInput] = useState('')
  const add = () => {
    const t = input.trim()
    if (t && !value.includes(t)) { onChange([...value, t]); setInput('') }
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] p-2 rounded-xl border" style={{ background: '#0F1117', borderColor: '#1E2536' }}>
        {value.map((t: string) => (
          <span key={t} className="tag">
            {t}
            <button onClick={() => onChange(value.filter((s: string) => s !== t))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input-field flex-1" placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl text-xs" style={{ background: '#00D4FF22', border: '1px solid #00D4FF44', color: '#00D4FF' }}><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid #1E2536' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#00D4FF22', border: '1px solid #00D4FF44' }}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display text-sm font-semibold" style={{ color: '#00D4FF' }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export default function ConfigPage() {
  const navigate = useNavigate()
  const { config, setConfig, setConfigId } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (!config.technologies.length) return toast.error('Select at least one technology')
    if (!config.companyName) return toast.error('Select a target company')
    setLoading(true)
    try {
      const payload = {
        technologies: config.technologies,
        primary_skills: config.primarySkills,
        secondary_skills: config.secondarySkills,
        experience_level: config.experienceLevel,
        difficulty: config.difficulty,
        num_questions: config.numQuestions,
        total_time: config.totalTime,
        question_types: config.questionTypes,
        self_validation_cutoff: config.selfValidationCutoff,
        company_name: config.companyName,
        interview_mode: config.interviewMode,
        ai_personality: config.aiPersonality,
        webcam_monitoring: config.webcamMonitoring,
        voice_analytics: config.voiceAnalytics,
        selected_llm: config.selectedLLM,
        sarvam_language: config.sarvamLanguage,
      }
      const res = await interviewAPI.saveConfig(payload)
      setConfigId(res.data.config_id)
      toast.success('Configuration saved!')
      navigate('/resume')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save config')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b" style={{ borderColor: '#1E2536' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-cyan" style={{ background: 'linear-gradient(135deg, #00D4FF, #7C3AED)' }}>
              <Brain className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold" style={{ color: '#00D4FF' }}>INTERVIEW CONFIGURATION</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-1 w-8 rounded-full transition-all" style={{ background: i === 1 ? 'linear-gradient(90deg, #00D4FF, #7C3AED)' : '#1E2536' }} />
                ))}
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500">Step 1 of 4</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Technologies */}
        <Section icon={Settings2} title="TECHNOLOGIES">
          <MultiSelect options={TECH_OPTIONS} selected={config.technologies} onChange={(v: string[]) => setConfig({ technologies: v })} label="Select Technologies *" />
        </Section>

        {/* Skills */}
        <Section icon={Brain} title="SKILLS">
          <div className="grid md:grid-cols-2 gap-4">
            <TagInput value={config.primarySkills} onChange={(v: string[]) => setConfig({ primarySkills: v })} placeholder="e.g., PyTorch, LangChain" label="Primary Skills" />
            <TagInput value={config.secondarySkills} onChange={(v: string[]) => setConfig({ secondarySkills: v })} placeholder="e.g., Docker, Git" label="Secondary Skills" />
          </div>
        </Section>

        {/* Company & Level */}
        <Section icon={Building2} title="TARGET COMPANY & LEVEL">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Company *</label>
              <select className="input-field" value={config.companyName} onChange={e => setConfig({ companyName: e.target.value })}>
                <option value="">-- Select Company --</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
              <select className="input-field" value={config.experienceLevel} onChange={e => setConfig({ experienceLevel: e.target.value })}>
                {['Fresher','0-1','1-3','3-5','5+'].map(l => <option key={l} value={l}>{l === 'Fresher' ? 'Fresher' : `${l} Years`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
              <div className="flex gap-2 flex-wrap">
                {['Easy','Medium','Hard','FAANG','Research Level'].map(d => (
                  <button key={d} type="button" onClick={() => setConfig({ difficulty: d })}
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={config.difficulty === d ? { background: 'linear-gradient(135deg, #00D4FF, #7C3AED)', color: '#0F1117' } : { background: '#0F1117', border: '1px solid #1E2536', color: '#64748B' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Mode</label>
              <div className="flex gap-2">
                {['Voice','Text','Hybrid'].map(m => (
                  <button key={m} type="button" onClick={() => setConfig({ interviewMode: m })}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={config.interviewMode === m ? { background: '#00D4FF22', border: '1px solid #00D4FF66', color: '#00D4FF' } : { background: '#0F1117', border: '1px solid #1E2536', color: '#64748B' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Interview Setup */}
        <Section icon={Sliders} title="INTERVIEW SETUP">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Questions: {config.numQuestions}</label>
              <input type="range" min={3} max={30} value={config.numQuestions} onChange={e => setConfig({ numQuestions: +e.target.value })}
                className="w-full accent-cyan-400" />
              <div className="flex justify-between text-xs text-slate-600 mt-1"><span>3</span><span>30</span></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time: {config.totalTime} min</label>
              <input type="range" min={15} max={120} step={5} value={config.totalTime} onChange={e => setConfig({ totalTime: +e.target.value })}
                className="w-full accent-cyan-400" />
              <div className="flex justify-between text-xs text-slate-600 mt-1"><span>15m</span><span>120m</span></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pass Cutoff: {config.selfValidationCutoff}%</label>
              <input type="range" min={0} max={100} step={5} value={config.selfValidationCutoff} onChange={e => setConfig({ selfValidationCutoff: +e.target.value })}
                className="w-full accent-purple-400" />
              <div className="flex justify-between text-xs text-slate-600 mt-1"><span>0%</span><span>100%</span></div>
            </div>
          </div>
          <MultiSelect options={Q_TYPES} selected={config.questionTypes} onChange={(v: string[]) => setConfig({ questionTypes: v })} label="Question Types" />
        </Section>

        {/* AI & Voice */}
        <Section icon={Mic} title="AI INTERVIEWER & VOICE">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Personality</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITIES.map(p => (
                  <button key={p} type="button" onClick={() => setConfig({ aiPersonality: p })}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={config.aiPersonality === p ? { background: '#7C3AED33', border: '1px solid #7C3AED66', color: '#A855F7' } : { background: '#0F1117', border: '1px solid #1E2536', color: '#64748B' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">LLM Engine</label>
                <select className="input-field" value={config.selectedLLM} onChange={e => setConfig({ selectedLLM: e.target.value })}>
                  {LLMS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sarvam AI Language</label>
                <select className="input-field" value={config.sarvamLanguage} onChange={e => setConfig({ sarvamLanguage: e.target.value })}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {[
              { key: 'webcamMonitoring', label: 'Webcam Monitoring', icon: Video },
              { key: 'voiceAnalytics', label: 'Voice Analytics', icon: Mic },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setConfig({ [key]: !config[key as keyof typeof config] })}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={(config as any)[key] ? { background: '#00D4FF22', border: '1px solid #00D4FF44' } : { background: '#0F1117', border: '1px solid #1E2536' }}>
                <div className="relative w-10 h-5 rounded-full transition-all" style={{ background: (config as any)[key] ? '#00D4FF' : '#1E2536' }}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: (config as any)[key] ? 'calc(100% - 18px)' : '2px' }} />
                </div>
                <Icon className="w-4 h-4" style={{ color: (config as any)[key] ? '#00D4FF' : '#64748B' }} />
                <span className="text-xs font-medium" style={{ color: (config as any)[key] ? '#00D4FF' : '#64748B' }}>{label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Next Button */}
        <button onClick={handleNext} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base">
          {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
            <><Brain className="w-5 h-5" /><span>SAVE & UPLOAD RESUME</span><ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  )
}