import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { resumeAPI } from '../services/api'
import { useAppStore } from '../store/appStore'
import { Upload, FileText, Brain, CheckCircle, ChevronRight, Zap, BarChart3, AlertTriangle, Star } from 'lucide-react'

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 40; const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#1E2536" strokeWidth="6" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-bold" style={{ color }}>{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
    </div>
  )
}

export default function ResumePage() {
  const navigate = useNavigate()
  const { resume, setResume, configId } = useAppStore()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setUploadedFile(file)
    setUploading(true)
    try {
      const res = await resumeAPI.upload(file)
      setResume({ id: res.data.resume_id, filename: file.name })
      toast.success('Resume uploaded!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!resume.id) return toast.error('Upload a resume first')
    setAnalyzing(true)
    try {
      const res = await resumeAPI.analyze(resume.id)
      setResume(res.data)
      toast.success('Resume analyzed successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    } finally { setAnalyzing(false) }
  }

  const analyzed = resume.ats_score > 0

  return (
    // <div className="min-h-screen grid-bg pb-20">
    <div className="min-h-screen grid-bg pb-20 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b" style={{ borderColor: '#1E2536' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1
  className="font-display text-lg font-bold tracking-[0.25em]"
  style={{
    color: '#00D4FF',
    textShadow: '0 0 18px rgba(0,212,255,.35)'
  }}
>RESUME INTELLIGENCE</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-1 w-8 rounded-full" style={{ background: i <= 2 ? 'linear-gradient(90deg, #00D4FF, #7C3AED)' : '#1E2536' }} />
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-500">Step 2 of 4</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Upload Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div {...getRootProps()} 
          // className="relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300"
            className="
relative
rounded-[28px]
p-12
text-center
cursor-pointer
transition-all
duration-300
glass-card
group
hover:scale-[1.01]
"
style={{ border: `2px dashed ${isDragActive ? '#00D4FF' : resume.id ? '#10B981' : '#1E2536'}`, background: isDragActive ? '#00D4FF08' : '#161B2780' }}>
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Uploading...</p>
              </div>
            ) : resume.id ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
                <p className="font-semibold text-emerald-400">{resume.filename}</p>
                <p className="text-xs text-slate-500">Click or drag to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {/* <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#00D4FF11', border: '1px solid #00D4FF22' }}> */}
                <div
  className="
  w-20 h-20
  rounded-3xl
  flex items-center justify-center
  floaty
  "
  style={{
    background: 'linear-gradient(135deg, rgba(0,212,255,.14), rgba(124,58,237,.14))',
    border: '1px solid rgba(255,255,255,.08)',
    boxShadow: '0 0 40px rgba(0,212,255,.15)'
  }}
>
    <Upload className="w-8 h-8" style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <p className="font-semibold text-white">{isDragActive ? 'Drop it here' : 'Upload Your Resume'}</p>
                  <p className="text-xs text-slate-500 mt-1">PDF or DOCX • Max 10MB</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analyze Button */}
        {resume.id && !analyzed && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleAnalyze} disabled={analyzing}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4">
            {analyzing ? (
              <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /><span>AI Analyzing Resume...</span></>
            ) : (
              <><Brain className="w-5 h-5" /><span>ANALYZE RESUME WITH AI</span><Zap className="w-4 h-4" /></>
            )}
          </motion.button>
        )}

        {/* Analysis Results */}
        <AnimatePresence>
          {analyzed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Scores */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-sm font-bold mb-6" style={{ color: '#00D4FF' }}>AI READINESS SCORES</h3>
                <div className="flex justify-around">
                  <ScoreRing value={resume.ats_score} label="ATS Score" color="#00D4FF" />
                  <ScoreRing value={resume.ai_readiness_score} label="AI Ready" color="#7C3AED" />
                  <ScoreRing value={resume.ml_readiness_score} label="ML Ready" color="#10B981" />
                  <ScoreRing value={resume.genai_readiness_score} label="GenAI Ready" color="#F59E0B" />
                </div>
              </div>

              {/* Skills */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-400">Strong Areas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.strong_areas.map((s) => <span key={s} className="px-2 py-1 rounded-md text-xs" style={{ background: '#10B98122', border: '1px solid #10B98144', color: '#10B981' }}>{s}</span>)}
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-amber-400">Weak Areas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.weak_areas.map((s) => <span key={s} className="px-2 py-1 rounded-md text-xs" style={{ background: '#F59E0B22', border: '1px solid #F59E0B44', color: '#F59E0B' }}>{s}</span>)}
                  </div>
                </div>
              </div>

              {/* Extracted Skills */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-primary">Extracted Skills ({resume.extracted_skills.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.extracted_skills.map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>

              {/* Missing Skills */}
              {resume.missing_skills.length > 0 && (
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h4 className="text-sm font-semibold text-red-400">Missing Skills</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.missing_skills.map((s) => <span key={s} className="px-2 py-1 rounded-md text-xs" style={{ background: '#EF444422', border: '1px solid #EF444444', color: '#EF4444' }}>{s}</span>)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <div className="flex gap-4">
          <button onClick={() => navigate('/config')} className="btn-ghost flex-1">← Back</button>
          <button onClick={() => navigate('/summary')} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            {analyzed ? 'REVIEW SUMMARY' : 'SKIP & CONTINUE'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}