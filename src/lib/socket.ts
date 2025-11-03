import { io, Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(url: string = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000') {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('Reconnection attempt:', attempt)
      this.reconnectAttempts = attempt
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed after', this.maxReconnectAttempts, 'attempts')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  joinMonitorRoom(monitorId: string) {
    if (this.socket && this.isSocketConnected()) {
      console.log('🔗 Joining monitor room:', monitorId)
      console.log('   Socket ID:', this.socket.id)

      // Get authentication token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No authentication token found for monitor')
        return
      }

      this.socket.emit('join_monitor', {
        monitor_id: monitorId,
        token: token
      })
      console.log('✅ Emitted join_monitor event with authentication')

      // Listen for confirmation
      this.socket.once('joined_monitor', (data) => {
        console.log('✅ Successfully joined monitor room:', data)
      })

      // Listen for authentication errors
      this.socket.once('error', (error) => {
        console.error('❌ Error joining monitor room:', error)
      })
    } else {
      console.error('❌ Cannot join monitor room: Socket not connected')
      console.log('   Socket exists:', !!this.socket)
      console.log('   Is connected:', this.isConnected)
    }
  }

  joinConversationRoom(conversationId: number, userType: 'user' | 'monitor' = 'user') {
    if (this.socket && this.isSocketConnected()) {
      console.log('🔗 Joining conversation room:', conversationId, 'as', userType)
      console.log('   Socket ID:', this.socket.id)
      this.socket.emit('join_conversation', {
        conversation_id: conversationId,
        user_type: userType
      })
      console.log('✅ Emitted join_conversation event')

      // Listen for confirmation
      this.socket.once('joined_conversation', (data) => {
        console.log('✅ Successfully joined conversation room:', data)
      })
    } else {
      console.error('❌ Cannot join conversation room: Socket not connected')
      console.log('   Socket exists:', !!this.socket)
      console.log('   Is connected:', this.isConnected)
      console.log('   conversationId:', conversationId)
    }
  }

  leaveConversationRoom(conversationId: number) {
    if (this.socket && this.isSocketConnected()) {
      this.socket.emit('leave_conversation', { conversation_id: conversationId })
      console.log('Left conversation room:', conversationId)
    }
  }

  sendMessage(conversationId: number, message: string, sender: string, sessionId?: string) {
    if (this.socket && this.isSocketConnected()) {
      this.socket.emit('send_message', {
        conversation_id: conversationId,
        message,
        sender,
        session_id: sessionId,
      })
    } else {
      console.error('Cannot send message: Socket not connected')
    }
  }

  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('new_message') // Remove old listeners
      this.socket.on('new_message', callback)
    }
  }

  onCrisisAlert(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('crisis_alert') // Remove old listeners
      this.socket.on('crisis_alert', callback)
    }
  }

  onConversationEscalated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('conversation_escalated') // Remove old listeners
      this.socket.on('conversation_escalated', callback)
    }
  }

  onMonitorJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('monitor_joined') // Remove old listeners
      this.socket.on('monitor_joined', callback)
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message')
    }
  }

  offCrisisAlert() {
    if (this.socket) {
      this.socket.off('crisis_alert')
    }
  }

  offMonitorJoined() {
    if (this.socket) {
      this.socket.off('monitor_joined')
    }
  }

  onMessageUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('message_updated') // Remove old listeners
      this.socket.on('message_updated', callback)
    }
  }

  offMessageUpdated() {
    if (this.socket) {
      this.socket.off('message_updated')
    }
  }

  getSocket() {
    return this.socket
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected
  }
}

export const socketManager = new SocketManager()
export default socketManager