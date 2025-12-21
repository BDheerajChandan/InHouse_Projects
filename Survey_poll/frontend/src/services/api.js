// ============================================
// FILE: src/services/api.js (UPDATED)
// ============================================
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

console.log('🔧 API configured for:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ No Response from backend');
    } else {
      console.error('❌ Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const pollAPI = {
  testConnection: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error('Backend not reachable');
    }
  },

  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  getPoll: async (pollId) => {
    const response = await api.get(`/polls/${pollId}`);
    return response.data;
  },

  submitResponse: async (pollId, responseData) => {
    const response = await api.post(`/polls/${pollId}/respond`, responseData);
    return response.data;
  },

  getResults: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  },

  deletePoll: async (pollId) => {
    const response = await api.delete(`/polls/${pollId}`);
    return response.data;
  },

  // deleteResponses(pollId) {
  //   return api.delete(`/api/polls/${pollId}/responses/reset`);
  // }

  deleteResponses(pollId) {
  return api.delete(`/polls/${pollId}/responses/reset`);
}


};

export default api;

