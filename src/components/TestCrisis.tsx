'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { chatAPI } from '@/lib/api'

export default function TestCrisis() {
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const createTestConversation = async () => {
    try {
      const conv = await chatAPI.createConversation('Test Crise')
      setConversationId(conv.id)
      console.log('Conversa criada:', conv)
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    }
  }

  const testCrisisMessage = async () => {
    if (!conversationId || !message.trim()) return

    setIsLoading(true)
    try {
      const response = await chatAPI.sendMessage(
        conversationId,
        'user',
        message,
        'test-session'
      )
      setResult(response)
      console.log('Resposta da API:', response)
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      setResult({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const testMessages = [
    'Olá, como você está?',
    'Estou muito triste hoje',
    'Não aguento mais viver assim',
    'Quero me matar',
    'Vou me suicidar agora'
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teste de Detecção de Crise</h2>

      <div className="space-y-4">
        <div>
          <Button onClick={createTestConversation} disabled={conversationId !== null}>
            {conversationId ? `Conversa ${conversationId} criada` : 'Criar Conversa de Teste'}
          </Button>
        </div>

        {conversationId && (
          <>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite uma mensagem de teste..."
                className="flex-1"
              />
              <Button onClick={testCrisisMessage} disabled={isLoading || !message.trim()}>
                {isLoading ? 'Enviando...' : 'Testar'}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <p className="font-medium">Mensagens de teste rápido:</p>
              {testMessages.map((msg, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(msg)}
                  className="text-left justify-start"
                >
                  {msg}
                </Button>
              ))}
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold mb-2">Resultado:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}