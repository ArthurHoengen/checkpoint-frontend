'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  Bell,
  Clock,
  User,
  X,
  CheckCircle
} from 'lucide-react'
import { socketManager } from '@/lib/socket'
import { formatDate } from '@/lib/utils'
import { monitorAPI } from '@/lib/api'

interface CrisisAlert {
  id: string
  conversation_id: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  keywords_found: string[]
  requires_human: boolean
  emergency_contact: boolean
  timestamp: string
  acknowledged: boolean
  user_message: string
}

interface CrisisAlertsProps {
  monitorId?: string
  currentConversationId?: number
}

export default function CrisisAlerts({ monitorId, currentConversationId }: CrisisAlertsProps) {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([])
  const [isMinimized, setIsMinimized] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    console.log('🔔 CrisisAlerts component mounted')
    console.log('   Monitor ID:', monitorId)
    console.log('   Current Conversation ID:', currentConversationId)

    if (!monitorId) {
      console.warn('⚠️  No monitorId provided - skipping socket connection')
      return
    }

    const socket = socketManager.connect()

    // Wait for socket to connect before joining room
    const handleConnect = () => {
      console.log('✅ Socket connected, now joining monitor room')
      console.log('   Socket ID:', socket?.id)
      console.log('   Monitor ID:', monitorId)

      socketManager.joinMonitorRoom(monitorId)
    }

    // If already connected, join immediately
    if (socketManager.isSocketConnected()) {
      console.log('Socket already connected - joining immediately')
      handleConnect()
    } else {
      // Otherwise, wait for connection
      console.log('Waiting for socket to connect...')
      socket?.on('connect', handleConnect)
    }

    if (socket && monitorId) {
      socketManager.onCrisisAlert((data) => {
        console.log('🚨 CRISIS ALERT RECEIVED:', data)
        console.log('   Conversation ID:', data.conversation_id)
        console.log('   Risk Level:', data.analysis.risk_level)
        console.log('   Current viewing conversation:', currentConversationId)

        // Ignorar alertas da conversa atual que o monitor já está atendendo
        if (currentConversationId && data.conversation_id === currentConversationId) {
          console.log('⚠️  Ignoring alert - already viewing this conversation')
          return
        }

        const newAlert: CrisisAlert = {
          id: `${data.conversation_id}-${Date.now()}`,
          conversation_id: data.conversation_id,
          risk_level: data.analysis.risk_level,
          confidence: data.analysis.confidence,
          keywords_found: data.analysis.keywords_found || [],
          requires_human: data.analysis.requires_human,
          emergency_contact: data.analysis.emergency_contact,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          user_message: data.message || 'Mensagem não disponível'
        }

        setAlerts(prev => [newAlert, ...prev])
        setUnreadCount(prev => prev + 1)
        console.log('✅ Alert added to list - Total alerts:', alerts.length + 1)

        // Auto-expandir quando recebe alerta de emergência
        if (data.analysis.emergency_contact || data.analysis.risk_level === 'critical') {
          console.log('🚨 CRITICAL ALERT - Auto-expanding widget')
          setIsMinimized(false)
        }

        if (data.analysis.emergency_contact) {
          playEmergencySound()
        } else {
          playAlertSound()
        }

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Alerta de Crise - Checkpoint', {
            body: `Nível ${data.analysis.risk_level} - Conversa #${data.conversation_id}`,
            icon: '/favicon.ico',
            tag: `crisis-${data.conversation_id}`
          })
        }
      })
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      // Remove listeners
      socketManager.offCrisisAlert()
      socket?.off('connect', handleConnect)
    }
  }, [monitorId, currentConversationId])

  const playAlertSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMhCjiK0e7Ldy0FK3DE5')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (error) {
      console.error('Erro ao reproduzir som de alerta:', error)
    }
  }

  const playEmergencySound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMhCjiK0e7Ldy0FK3DE5')
      audio.volume = 0.7
      audio.play().catch(() => {})
    } catch (error) {
      console.error('Erro ao reproduzir som de emergência:', error)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledged: true }
          : alert
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleTakeControl = async (conversationId: number) => {
    try {
      await monitorAPI.takeControl(conversationId)

      window.open(`/monitor/conversation/${conversationId}`, '_blank')

      setAlerts(prev =>
        prev.map(alert =>
          alert.conversation_id === conversationId
            ? { ...alert, acknowledged: true }
            : alert
        )
      )
    } catch (error) {
      console.error('Erro ao assumir controle:', error)
    }
  }

  const clearAllAlerts = () => {
    setAlerts([])
    setUnreadCount(0)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-300 animate-pulse'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (riskLevel: string, emergency: boolean) => {
    if (emergency) {
      return <AlertTriangle className="h-5 w-5 text-red-600 animate-bounce" />
    }

    switch (riskLevel) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="relative bg-red-600 hover:bg-red-700 text-white shadow-lg"
          size="lg"
        >
          <Bell className="h-5 w-5 mr-2" />
          Alertas
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[70vh] bg-white rounded-lg shadow-xl border border-gray-200 z-40">
      <div className="flex items-center justify-between p-4 border-b bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-800">Alertas de Crise</h3>
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllAlerts}
              className="text-xs"
            >
              Limpar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-[calc(70vh-80px)] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Nenhum alerta ativo</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-b ${getRiskColor(alert.risk_level)} ${
                !alert.acknowledged ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(alert.risk_level, alert.emergency_contact)}
                  <span className="font-medium text-sm">
                    Conversa #{alert.conversation_id}
                  </span>
                  <span className="text-xs bg-white px-2 py-1 rounded-full border">
                    {alert.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(alert.timestamp)}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Última mensagem:</p>
                <p className="text-sm bg-white p-2 rounded border truncate">
                  "{alert.user_message}"
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <div className="flex items-center space-x-1 mb-1">
                    <span>Confiança: {Math.round(alert.confidence * 100)}%</span>
                  </div>
                  {alert.keywords_found.length > 0 && (
                    <div className="text-gray-600">
                      Palavras: {alert.keywords_found.slice(0, 3).join(', ')}
                      {alert.keywords_found.length > 3 && '...'}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs"
                    >
                      Confirmar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleTakeControl(alert.conversation_id)}
                    className="text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Assumir
                  </Button>
                </div>
              </div>

              {alert.emergency_contact && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                  🚨 <strong>EMERGÊNCIA:</strong> Contato imediato necessário
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}