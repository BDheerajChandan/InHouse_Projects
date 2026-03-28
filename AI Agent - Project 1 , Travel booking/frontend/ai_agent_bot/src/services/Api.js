/* ═══════════════════════════════════════════════════════════
   services/api.js
   Axios client with:
   - Long timeout for LLM calls (OpenAI can be slow)
   - AbortController support for cancellation
   - Clear error messages for each failure type
   ═══════════════════════════════════════════════════════════ */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/* ── Axios instance ─────────────────────────────────────────── */
const http = axios.create({
  baseURL: BASE_URL,
  // 90 seconds — LLM calls (especially gpt-3.5-turbo with large prompts)
  // can take 20-40s on slow connections. Never set below 60s.
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Response interceptor — human-readable errors ───────────── */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cancelled by user
    if (axios.isCancel(error)) {
      return Promise.reject(new Error('Request cancelled.'))
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(new Error(
        '⏱️ Request timed out. The AI is taking too long — please try again. ' +
        'Tip: switch to a shorter model (gpt-3.5-turbo) or use Gemini.'
      ))
    }

    // No response at all (backend not running)
    if (!error.response) {
      return Promise.reject(new Error(
        '🔌 Cannot reach the backend. ' +
        'Make sure the FastAPI server is running on http://localhost:8000'
      ))
    }

    // Backend returned an error response
    const detail =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      `HTTP ${error.response?.status} error`

    return Promise.reject(new Error(String(detail)))
  }
)

/* ── Chat API ────────────────────────────────────────────────── */

/**
 * Send a message to the AI booking agent.
 * Pass an AbortController signal to allow cancellation.
 *
 * @param {string} message
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function chatWithAgent(message, signal = null) {
  const config = signal ? { signal } : {}
  const { data } = await http.post('/api/chat', { message }, config)
  return data
}

/**
 * Health-check — called on mount to verify backend is up.
 * Short timeout: we just want a quick ping.
 */
export async function healthCheck() {
  const { data } = await http.get('/health', { timeout: 5_000 })
  return data
}

export default http