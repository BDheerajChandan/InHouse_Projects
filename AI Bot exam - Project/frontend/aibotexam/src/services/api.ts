import axios from 'axios'

const API_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

// Attach token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('ai-interview-store')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const token = parsed?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ai-interview-store')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (email: string, password: string) => {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)
    return api.post('/api/auth/login', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  me: () => api.get('/api/auth/me'),
}

// Resume
export const resumeAPI = {
  upload: (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/api/resume/upload', fd)
  },
  analyze: (id: number) => api.post(`/api/resume/analyze/${id}`),
  list: () => api.get('/api/resume/list'),
  get: (id: number) => api.get(`/api/resume/${id}`),
}

// Interview
export const interviewAPI = {
  saveConfig: (config: any) => api.post('/api/interview/config', config),
  getConfig: (id: number) => api.get(`/api/interview/config/${id}`),
  createSession: (configId: number, resumeId?: number) =>
    api.post('/api/interview/session/create', { config_id: configId, resume_id: resumeId }),
  startSession: (id: number) => api.post(`/api/interview/session/${id}/start`),
  nextQuestion: (id: number) => api.post(`/api/interview/session/${id}/next-question`),
  submitAnswer: (data: any) => api.post('/api/interview/answer/submit', data),
  endInterview: (id: number) => api.post(`/api/interview/session/${id}/end`),
  getReport: (id: number) => api.get(`/api/interview/session/${id}/report`),
  getSessions: () => api.get('/api/interview/sessions'),
}

// Analytics
export const analyticsAPI = {
  getSession: (id: number) => api.get(`/api/analytics/session/${id}`),
  getQuestions: (id: number) => api.get(`/api/analytics/session/${id}/questions`),
  getDashboard: () => api.get('/api/analytics/dashboard'),
}

// Voice
export const voiceAPI = {
  tts: (text: string, language: string, personality: string) =>
    api.post('/api/voice/tts', { text, language, personality }, { responseType: 'arraybuffer' }),
  stt: (audioBlob: Blob, language: string) => {
    const fd = new FormData(); fd.append('file', audioBlob, 'audio.wav')
    return api.post(`/api/voice/stt?language=${language}`, fd)
  },
}

export const WS_URL = API_URL.replace('http', 'ws')