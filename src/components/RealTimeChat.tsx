'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, UserCheck, AlertTriangle } from 'lucide-react'
import { socketManager } from '@/lib/socket'
import { chatAPI } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Message } from '@/types'

interface RealTimeChatProps {
  conversationId: number
  currentUser: 'user' | 'monitor'
  sessionId?: string
  monitorId?: string
}

export default function RealTimeChat({
  conversationId,
  currentUser,
  sessionId,
  monitorId
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [monitorPresent, setMonitorPresent] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing messages first
    const loadMessages = async () => {
      try {
        const existingMessages = await chatAPI.getMessages(conversationId)
        setMessages(existingMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()

    const socket = socketManager.connect()

    // Function to join rooms
    const joinRooms = () => {
      console.log('🚪 Joining rooms...', {
        conversationId,
        currentUser,
        monitorId,
        isConnected: socketManager.isSocketConnected()
      })

      socketManager.joinConversationRoom(conversationId, currentUser)

      if (currentUser === 'monitor' && monitorId) {
        socketManager.joinMonitorRoom(monitorId)
      }
    }

    if (socket) {
      // Check if already connected
      if (socketManager.isSocketConnected()) {
        console.log('Socket already connected - joining immediately')
        setIsConnected(true)
        joinRooms()
      } else {
        console.log('Socket not connected yet - waiting for connect event')
      }

      socket.on('connect', () => {
        console.log('Socket connected - joining rooms')
        setIsConnected(true)
        joinRooms()
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socketManager.onNewMessage((data) => {
        if (data.conversation_id === conversationId) {
          console.log('📨 New message received:', {
            id: data.message.id,
            sender: data.message.sender,
            text: data.message.text.substring(0, 50),
            currentUser,
            conversationId: data.conversation_id
          })

          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg =>
              msg.id === data.message.id ||
              (msg.text === data.message.text &&
               msg.sender === data.message.sender &&
               Math.abs(new Date(msg.created_at).getTime() - new Date(data.message.created_at).getTime()) < 1000)
            )

            if (messageExists) {
              console.log('⚠️  Message already exists, skipping:', data.message.id)
              return prev
            }

            console.log('✅ Adding message to list:', data.message.id)
            return [...prev, data.message]
          })
          setIsTyping(false)

          // Clear pending message when user message is confirmed
          if (data.message.sender === currentUser) {
            console.log('✅ Clearing pending message for sender:', currentUser)
            setPendingMessage(null)
          }

          // Stop AI thinking when AI responds
          if (data.message.sender === 'ai') {
            setIsAiThinking(false)
          }
        } else {
          console.log('⚠️  Message for different conversation:', data.conversation_id, 'expected:', conversationId)
        }
      })

      socketManager.onMessageUpdated((data) => {
        if (data.conversation_id === conversationId) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.message_id
                ? { ...msg, flagged: data.flagged, risk_level: data.risk_level }
                : msg
            )
          )
        }
      })

      socketManager.onMonitorJoined((data) => {
        if (data.conversation_id === conversationId) {
          setMonitorPresent(true)
          setIsAiThinking(false) // Stop AI thinking when monitor joins
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'system',
            text: 'Um monitor entrou na conversa',
            created_at: new Date().toISOString(),
            flagged: false,
            notified: false,
          } as Message])
        }
      })

      socketManager.onCrisisAlert((data) => {
        if (data.conversation_id === conversationId) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'system',
            text: `⚠️ Alerta de crise: ${data.analysis.risk_level}`,
            created_at: new Date().toISOString(),
            flagged: true,
            risk_level: data.analysis.risk_level,
            notified: false,
          } as Message])
        }
      })

      socket.on('user_typing', (data) => {
        if (data.conversation_id === conversationId && data.user !== currentUser) {
          setIsTyping(true)
          setTimeout(() => setIsTyping(false), 3000)
        }
      })

    }

    // Heartbeat to keep conversation active (only for regular users, not monitors)
    let heartbeatInterval: NodeJS.Timeout | null = null
    if (currentUser === 'user') {
      heartbeatInterval = setInterval(() => {
        if (socketManager.isSocketConnected()) {
          socket?.emit('heartbeat', {
            conversation_id: conversationId,
            session_id: sessionId
          })
        }
      }, 30000) // Send heartbeat every 30 seconds

      console.log('✅ Heartbeat started for conversation', conversationId)
    }

    return () => {
      // Clear heartbeat interval
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
        console.log('🛑 Heartbeat stopped for conversation', conversationId)
      }

      socketManager.leaveConversationRoom(conversationId)
      socketManager.offNewMessage()
      socketManager.offMonitorJoined()
      socketManager.offMessageUpdated()
      // Don't disconnect - other components may be using the socket
    }
  }, [conversationId, currentUser, monitorId, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingMessage, isAiThinking, isTyping])

  const sendMessage = () => {
    if (!inputText.trim() || !isConnected) {
      console.log('❌ Cannot send message:', { hasText: !!inputText.trim(), isConnected })
      return
    }

    const messageText = inputText.trim()

    console.log('📤 Sending message:', {
      conversationId,
      sender: currentUser,
      text: messageText.substring(0, 50),
      sessionId
    })

    // Show pending message immediately for better UX
    setPendingMessage(messageText)

    // If user message and no monitor present, prepare AI thinking indicator
    if (currentUser === 'user' && !monitorPresent) {
      setIsAiThinking(true)
    }

    socketManager.sendMessage(
      conversationId,
      messageText,
      currentUser,
      sessionId
    )

    setInputText('')
  }

  const handleTyping = () => {
    if (socketManager.getSocket()) {
      socketManager.getSocket()?.emit('typing', {
        conversation_id: conversationId,
        user: currentUser
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else {
      handleTyping()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {monitorPresent && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <UserCheck className="h-4 w-4" />
            <span>Monitor presente</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === currentUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === currentUser
                  ? currentUser === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                  : message.sender === 'system'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : message.sender === 'monitor'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium opacity-70">
                  {message.sender === 'monitor' ? 'Monitor' :
                   message.sender === 'system' ? 'Sistema' :
                   message.sender === 'user' ? 'Você' : 'IA'}
                </span>
                {message.flagged && (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <div className="text-xs opacity-70 mt-1">
                {formatDate(message.created_at)}
              </div>
            </div>
          </div>
        ))}

        {/* Pending message indicator */}
        {pendingMessage && (
          <div className="flex justify-end">
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg opacity-70 ${
              currentUser === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium opacity-70">
                  {currentUser === 'user' ? 'Você' : 'Monitor'}
                </span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{pendingMessage}</p>
              <div className="text-xs opacity-70 mt-1">Enviando...</div>
            </div>
          </div>
        )}

        {/* AI thinking indicator - only show for user messages when no monitor present */}
        {isAiThinking && currentUser === 'user' && !monitorPresent && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium opacity-70">IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Digitando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Digite sua mensagem como ${currentUser === 'user' ? 'usuário' : 'monitor'}...`}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputText.trim() || !isConnected}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isConnected
            ? 'Pressione Enter para enviar. Conversa em tempo real.'
            : 'Reconectando...'
          }
        </p>
      </div>
    </div>
  )
}