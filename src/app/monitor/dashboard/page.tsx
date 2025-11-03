'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Shield,
  MessageCircle,
  AlertTriangle,
  Users,
  Clock,
  LogOut,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react'
import { monitorAPI, chatAPI } from '@/lib/api'
import { formatDate, getRiskLevelColor, getRiskLevelBg } from '@/lib/utils'
import CrisisAlerts from '@/components/CrisisAlerts'
import RealTimeChat from '@/components/RealTimeChat'
import { socketManager } from '@/lib/socket'
import type { Conversation, Message } from '@/types'

export default function MonitorDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [flaggedMessages, setFlaggedMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'escalated' | 'flagged'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [username, setUsername] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')

    if (!token) {
      router.push('/monitor/login')
      return
    }

    setUsername(storedUsername || 'Monitor')
    loadDashboardData()
  }, [router])

  // Escutar novas mensagens via WebSocket para atualizar a lista em tempo real
  useEffect(() => {
    if (!username) return

    const socket = socketManager.connect()

    // Monitor recebe todas as mensagens via seu room monitor_{username}
    console.log(`📡 Monitor ${username} conectado e ouvindo todas as mensagens`)

    // Listener para novas mensagens
    socketManager.onNewMessage((data) => {
      console.log('📨 Nova mensagem recebida no dashboard:', data)

      setConversations(prev => {
        // Verificar se a conversa já existe
        const conversationExists = prev.some(conv => conv.id === data.conversation_id)

        if (conversationExists) {
          // Atualizar conversa existente
          return prev.map(conv => {
            if (conv.id === data.conversation_id) {
              const messageExists = conv.messages.some(m => m.id === data.message.id)

              if (!messageExists) {
                return {
                  ...conv,
                  messages: [...conv.messages, data.message]
                }
              }
            }
            return conv
          })
        } else {
          // Nova conversa detectada! Adicionar à lista
          console.log('🆕 Nova conversa detectada:', data.conversation_id)

          const newConversation: Conversation = {
            id: data.conversation_id,
            title: `Conversa #${data.conversation_id}`,
            mode: 'user',
            active: true,
            status: 'active',
            messages: [data.message],
            created_at: data.message.created_at
          }

          return [newConversation, ...prev]
        }
      })

      // Se a mensagem é da conversa selecionada, atualizar também
      if (selectedConversation && selectedConversation.id === data.conversation_id) {
        setSelectedConversation(prev => {
          if (!prev) return prev

          const messageExists = prev.messages.some(m => m.id === data.message.id)

          if (!messageExists) {
            return {
              ...prev,
              messages: [...prev.messages, data.message]
            }
          }

          return prev
        })
      }
    })

    return () => {
      socketManager.offNewMessage()
    }
  }, [username, selectedConversation])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [conversationsData, flaggedData] = await Promise.all([
        monitorAPI.getDashboard(),
        monitorAPI.getFlaggedMessages()
      ])

      setConversations(conversationsData)
      setFlaggedMessages(flaggedData)

      // Verificar se há parâmetro conversation na URL (apenas na montagem inicial)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const conversationIdParam = params.get('conversation')

        if (conversationIdParam) {
          const conversationId = parseInt(conversationIdParam)
          const conversation = conversationsData.find(c => c.id === conversationId)

          if (conversation) {
            console.log('🔗 Abrindo conversa automaticamente:', conversationId)
            setSelectedConversation(conversation)

            // Limpar o parâmetro da URL
            window.history.replaceState({}, '', '/monitor/dashboard')
          } else {
            console.warn('⚠️  Conversa não encontrada:', conversationId)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        router.push('/monitor/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTakeControl = async (conversationId: number) => {
    try {
      await monitorAPI.takeControl(conversationId)

      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
      }

      await loadDashboardData()
    } catch (error) {
      console.error('Erro ao assumir controle:', error)
    }
  }

  const handleEscalate = async (conversationId: number, reason: string) => {
    try {
      await monitorAPI.escalateConversation(conversationId, reason)
      await loadDashboardData()
    } catch (error) {
      console.error('Erro ao escalar conversa:', error)
    }
  }


  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/monitor/login')
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'escalated' && conv.status === 'escalated') ||
      (filter === 'flagged' && conv.messages.some(m => m.flagged))

    const matchesSearch =
      !searchTerm ||
      conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-blue-600 animate-pulse" />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard do Monitor</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {conversations.length} conversas
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                  {flaggedMessages.length} alertas
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Filtros e Busca</h2>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="flex-1"
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filter === 'escalated' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('escalated')}
                    className="flex-1"
                  >
                    Escaladas
                  </Button>
                  <Button
                    variant={filter === 'flagged' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('flagged')}
                    className="flex-1"
                  >
                    Flagadas
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Conversas ({filteredConversations.length})</h2>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">
                        {conversation.title || `Conversa #${conversation.id}`}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        conversation.status === 'escalated'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {conversation.status === 'escalated' ? 'Escalada' : 'Ativa'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      {formatDate(conversation.created_at || '')}
                    </div>

                    {conversation.messages.length > 0 && (
                      <div className="text-sm text-gray-600 truncate">
                        {conversation.messages[conversation.messages.length - 1].text}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {conversation.messages.length} mensagens
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTakeControl(conversation.id)
                        }}
                        className="text-xs"
                      >
                        Assumir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-200px)] flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">
                      {selectedConversation.title || `Conversa #${selectedConversation.id}`}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = prompt('Motivo da escalação:')
                          if (reason) handleEscalate(selectedConversation.id, reason)
                        }}
                      >
                        Escalar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <RealTimeChat
                    conversationId={selectedConversation.id}
                    currentUser="monitor"
                    monitorId={username}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Selecione uma conversa</p>
                  <p className="text-sm">
                    Escolha uma conversa na lista ao lado para visualizar e responder
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CrisisAlerts monitorId={username} currentConversationId={selectedConversation?.id} />
    </div>
  )
}