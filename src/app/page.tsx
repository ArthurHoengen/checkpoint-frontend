'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, MessageCircle } from 'lucide-react'
import { chatAPI } from '@/lib/api'
import { generateSessionId } from '@/lib/utils'
import RealTimeChat from '@/components/RealTimeChat'
import type { Conversation } from '@/types'

export default function ChatPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [sessionId] = useState(() => generateSessionId())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    initializeChat()
  }, [])

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      const conv = await chatAPI.createConversation('Nova Conversa')
      setConversation(conv)
    } catch (error) {
      console.error('Erro ao inicializar chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-blue-600 animate-pulse" />
          <p className="mt-4 text-gray-600">Iniciando conversa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <MessageCircle className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">Checkpoint</h1>
            <p className="text-blue-100 text-sm">Estamos aqui para ajudar você</p>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-white hover:bg-blue-50"
              onClick={() => window.location.href = '/monitor/login'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Monitor
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        {conversation ? (
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)]">
            <RealTimeChat
              conversationId={conversation.id}
              currentUser="user"
              sessionId={sessionId}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Inicializando chat...</p>
              <p className="text-sm">Aguarde um momento</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}