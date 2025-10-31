'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import RealTimeChat from '@/components/RealTimeChat'
import CrisisAlerts from '@/components/CrisisAlerts'
import { chatAPI } from '@/lib/api'
import type { Conversation } from '@/types'

export default function MonitorConversationPage() {
  const params = useParams()
  const router = useRouter()

  const idParam = Array.isArray(params.id) ? params.id[0] : params.id
  const conversationId = idParam ? parseInt(idParam) : null

  console.log(conversationId)

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')

    if (!token) {
      router.push('/monitor/login')
      return
    }

    setUsername(storedUsername || 'Monitor')
  }, [router])

  useEffect(() => {
    if (!username || !conversationId) return
    loadConversation()
  }, [username, conversationId])

  const loadConversation = async () => {
    try {
      setIsLoading(true)
      const msgs = await chatAPI.getMessages(conversationId!)

      setConversation({
        id: conversationId!,
        title: `Conversa #${conversationId}`,
        mode: 'monitor',
        active: true,
        status: 'escalated',
        messages: msgs
      })
    } catch (error) {
      console.error('Erro ao carregar conversa:', error)
      if ((error as any)?.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        router.push('/monitor/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !conversationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-blue-600 animate-pulse" />
          <p className="mt-4 text-gray-600">
            {conversationId ? 'Carregando conversa...' : 'Conversa inválida'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/monitor/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {conversation?.title || `Conversa #${conversationId}`}
                </h1>
                <p className="text-sm text-gray-500">Monitor: {username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                Escalada
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)]">
          {conversation && username && (
            <RealTimeChat
              conversationId={conversationId!}
              currentUser="monitor"
              monitorId={username}
            />
          )}
        </div>
      </main>

      <CrisisAlerts
        monitorId={username}
        currentConversationId={conversationId!}
      />
    </div>
  )
}
