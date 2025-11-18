import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },
}

// Chat API
export const chatAPI = {
  createConversation: async (title?: string) => {
    const response = await api.post('/chat/conversations', { title })
    return response.data
  },

  getMessages: async (conversationId: number) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`)
    return response.data
  },

  sendMessage: async (conversationId: number, sender: string, text: string, sessionId?: string) => {
    const response = await api.post(`/chat/conversations/${conversationId}/ask-with-crisis-detection`, {
      sender,
      text,
      session_id: sessionId,
    })
    return response.data
  },
}

// Monitor API
export const monitorAPI = {
  getDashboard: async () => {
    const response = await api.get('/chat/monitor/dashboard')
    return response.data
  },

  takeControl: async (conversationId: number) => {
    const response = await api.post(`/chat/monitor/take-control/${conversationId}`)
    return response.data
  },

  escalateConversation: async (conversationId: number, reason: string) => {
    const response = await api.post(`/chat/monitor/escalate/${conversationId}`, {
      conversation_id: conversationId,
      reason
    })
    return response.data
  },

  getFlaggedMessages: async (limit = 50) => {
    const response = await api.get('/chat/monitor/flagged-messages', {
      params: { limit }
    })
    return response.data
  },
}