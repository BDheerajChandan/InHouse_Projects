import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface InterviewConfig {
  technologies: string[]
  primarySkills: string[]
  secondarySkills: string[]
  experienceLevel: string
  difficulty: string
  numQuestions: number
  totalTime: number
  questionTypes: string[]
  selfValidationCutoff: number
  companyName: string
  interviewMode: string
  aiPersonality: string
  webcamMonitoring: boolean
  voiceAnalytics: boolean
  selectedLLM: string
  sarvamLanguage: string
}

export interface ResumeData {
  id: number | null
  filename: string
  ats_score: number
  ai_readiness_score: number
  ml_readiness_score: number
  genai_readiness_score: number
  strong_areas: string[]
  weak_areas: string[]
  missing_skills: string[]
  extracted_skills: string[]
  projects: any[]
  certifications: string[]
  experience_years: number
  education: any[]
  parsed_data: any
}

export interface SessionData {
  id: number | null
  token: string
  configId: number | null
  status: string
  strategy: any
  currentQuestionIndex: number
  currentQuestion: any
  answers: any[]
  overallScore: number
}

interface AppState {
  // Auth
  token: string | null
  user: any | null
  setAuth: (token: string, user: any) => void
  clearAuth: () => void

  // Config
  config: InterviewConfig
  configId: number | null
  setConfig: (config: Partial<InterviewConfig>) => void
  setConfigId: (id: number) => void

  // Resume
  resume: ResumeData
  setResume: (resume: Partial<ResumeData>) => void

  // Session
  session: SessionData
  setSession: (session: Partial<SessionData>) => void
  addAnswer: (answer: any) => void
  resetSession: () => void
}

const defaultConfig: InterviewConfig = {
  technologies: [],
  primarySkills: [],
  secondarySkills: [],
  experienceLevel: 'Fresher',
  difficulty: 'Medium',
  numQuestions: 10,
  totalTime: 60,
  questionTypes: [],
  selfValidationCutoff: 60,
  companyName: '',
  interviewMode: 'Hybrid',
  aiPersonality: 'Friendly',
  webcamMonitoring: false,
  voiceAnalytics: true,
  selectedLLM: 'openai',
  sarvamLanguage: 'en-IN',
}

const defaultResume: ResumeData = {
  id: null, filename: '', ats_score: 0,
  ai_readiness_score: 0, ml_readiness_score: 0, genai_readiness_score: 0,
  strong_areas: [], weak_areas: [], missing_skills: [], extracted_skills: [],
  projects: [], certifications: [], experience_years: 0, education: [], parsed_data: {},
}

const defaultSession: SessionData = {
  id: null, token: '', configId: null, status: 'pending',
  strategy: null, currentQuestionIndex: 0, currentQuestion: null,
  answers: [], overallScore: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null, user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),

      config: defaultConfig, configId: null,
      setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
      setConfigId: (id) => set({ configId: id }),

      resume: defaultResume,
      setResume: (r) => set((s) => ({ resume: { ...s.resume, ...r } })),

      session: defaultSession,
      setSession: (s) => set((prev) => ({ session: { ...prev.session, ...s } })),
      addAnswer: (answer) => set((s) => ({ session: { ...s.session, answers: [...s.session.answers, answer] } })),
      resetSession: () => set({ session: defaultSession }),
    }),
    { name: 'ai-interview-store', partialize: (s) => ({ token: s.token, user: s.user, config: s.config, configId: s.configId }) }
  )
)