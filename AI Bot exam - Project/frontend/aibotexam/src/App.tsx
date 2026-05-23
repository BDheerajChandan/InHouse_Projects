import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from './store/appStore'
import LoginPage from './pages/LoginPage'
import ConfigPage from './pages/ConfigPage'
import ResumePage from './pages/ResumePage'
import SummaryPage from './pages/SummaryPage'
import InterviewPage from './pages/InterviewPage'
import ReportPage from './pages/ReportPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#161B27', color: '#E2E8F0', border: '1px solid #1E2536' },
          success: { iconTheme: { primary: '#00D4FF', secondary: '#0F1117' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#0F1117' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
        <Route path="/interview/:sessionId" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/report/:sessionId" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}