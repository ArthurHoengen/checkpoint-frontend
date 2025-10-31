export interface Message {
  id: number
  sender: string
  text: string
  created_at: string
  session_id?: string
  flagged: boolean
  risk_level?: string
  escalation_level?: string
  notified: boolean
  intervention_timestamp?: string
  extra_data?: Record<string, any>
}

export interface Conversation {
  id: number
  title?: string
  mode: string
  active: boolean
  status?: string
  created_at?: string
  updated_at?: string
  messages: Message[]
}

export interface CrisisAnalysis {
  risk_level: string
  confidence: number
  keywords_found: string[]
  requires_human: boolean
  emergency_contact: boolean
  analysis_details: Record<string, any>
}

export interface ChatResponse {
  ai_response?: Message
  crisis_analysis?: CrisisAnalysis
  escalated: boolean
  message?: string
}

export interface User {
  id: number
  username: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}