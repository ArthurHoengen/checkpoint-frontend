# Checkpoint Frontend

Frontend da aplicação Checkpoint - Sistema de chatbot com detecção de crise e suporte humano em tempo real.

## Funcionalidades

### Para Usuários
- **Chat com IA em Tempo Real**: Interface amigável com comunicação via WebSocket
- **Detecção Automática de Crise**: Sistema que monitora sinais de risco em tempo real
- **Escalação Automática**: Conversas são automaticamente escaladas para monitores quando detectado risco
- **Indicadores de Status**: Mostra quando monitor entra na conversa e status de conexão
- **Interface Responsiva**: Design mobile-first que funciona em todos os dispositivos
- **Indicador de Digitação**: Feedback visual quando IA ou monitor está digitando
- **Heartbeat Automático**: Mantém sessões ativas com ping periódico ao backend

### Para Monitores
- **Autenticação JWT**: Sistema seguro de login com tokens
- **Dashboard em Tempo Real**: Visão geral de todas as conversas com atualizações automáticas via WebSocket
- **Sistema de Alertas de Crise**: Widget flutuante com notificações sonoras e visuais baseadas em níveis de risco
- **Chat Bidirecional**: Comunicação direta com usuários em tempo real
- **Assumir Controle**: Capacidade de assumir controle de conversas e desativar respostas da IA
- **Filtros e Busca**: Filtrar conversas por status (todas, escaladas, flagadas) e busca em tempo real
- **Notificações Desktop**: Suporte a notificações do navegador para alertas críticos
- **Detecção de Novas Conversas**: Automaticamente detecta e exibe novas conversas iniciadas

## Tecnologias Utilizadas

- **Next.js 14.2** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Socket.IO Client 4.8** - Comunicação em tempo real bidirecional
- **Axios 1.7** - Cliente HTTP para API REST
- **Lucide React** - Biblioteca de ícones moderna
- **Date-fns 4.1** - Manipulação e formatação de datas
- **clsx & tailwind-merge** - Utilitários para classes CSS condicionais

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                          # App Router do Next.js
│   │   ├── page.tsx                 # Chat principal do usuário
│   │   ├── layout.tsx               # Layout global da aplicação
│   │   ├── globals.css              # Estilos globais com Tailwind
│   │   ├── test-crisis/             # Página de teste de alertas
│   │   │   └── page.tsx
│   │   └── monitor/                 # Área administrativa dos monitores
│   │       ├── login/page.tsx       # Login JWT para monitores
│   │       └── dashboard/page.tsx   # Dashboard com lista de conversas e chat
│   ├── components/                  # Componentes React reutilizáveis
│   │   ├── ui/                      # Componentes base de UI
│   │   │   ├── button.tsx           # Botão customizável
│   │   │   └── input.tsx            # Input de texto
│   │   ├── RealTimeChat.tsx         # Chat em tempo real via WebSocket
│   │   ├── CrisisAlerts.tsx         # Widget de alertas de crise
│   │   └── TestCrisis.tsx           # Componente para testar alertas
│   ├── lib/                         # Utilitários e configurações
│   │   ├── api.ts                   # Cliente Axios com interceptors
│   │   ├── socket.ts                # SocketManager singleton
│   │   └── utils.ts                 # Funções auxiliares (formatDate, etc)
│   └── types/                       # Definições TypeScript
│       └── index.ts                 # Interfaces (Message, Conversation, etc)
├── public/                          # Arquivos estáticos
├── .env.local                       # Variáveis de ambiente (não commitado)
├── next.config.js                   # Configuração do Next.js
├── tailwind.config.js               # Configuração do Tailwind CSS
├── tsconfig.json                    # Configuração do TypeScript
└── package.json                     # Dependências e scripts
```

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+ ou 20+
- npm (vem com Node.js)
- Backend Checkpoint rodando (padrão: http://localhost:8000)

### Instalação

```bash
# Clone o repositório (se ainda não clonou)
git clone https://github.com/ArthurHoengen/checkpoint-frontend.git
cd checkpoint/frontend

# Instalar dependências
npm install
```

### Configuração

Crie o arquivo `.env.local` na raiz do projeto frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

**Importante**: Essas variáveis devem apontar para o backend Checkpoint em execução.

### Execução

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
```

A aplicação estará disponível em `http://localhost:3000`.

## Fluxo da Aplicação

### Usuário Regular

1. Acessa a página principal (`/`)
2. Sistema cria automaticamente uma conversa via API
3. Usuário digita mensagens que são enviadas via WebSocket
4. IA responde em tempo real através do WebSocket
5. Sistema backend monitora automaticamente sinais de crise
6. Se detectado risco alto/crítico, conversa é escalada automaticamente para monitor
7. Usuário recebe notificação quando monitor entra na conversa
8. Heartbeat mantém a sessão ativa (30s)

### Monitor

1. Faz login em `/monitor/login` com credenciais JWT
2. Acessa dashboard em `/monitor/dashboard`
3. Dashboard se conecta ao room do monitor via WebSocket
4. Visualiza lista de conversas ativas em tempo real
5. Recebe alertas de crise via WebSocket no widget `CrisisAlerts`
6. Pode filtrar conversas (todas, escaladas, flagadas) e buscar
7. Assume controle de conversas (envia evento `join_monitor` via WebSocket)
8. Conversa diretamente com usuários através do `RealTimeChat`
9. Pode escalar conversas manualmente se necessário

## Principais Recursos

### Sistema de Alertas de Crise

O componente `CrisisAlerts` exibe alertas em tempo real recebidos via WebSocket:

- **Níveis de Risco**:
  - `low`: Notificação visual amarela
  - `medium`: Notificação visual laranja
  - `high`: Notificação visual vermelha + som
  - `critical`: Notificação vermelha pulsante + som + auto-expansão

- **Funcionalidades**:
  - Widget flutuante minimizável
  - Notificações sonoras diferenciadas por severidade
  - Notificações desktop do navegador (se permitido)
  - Contador de alertas não lidos
  - Botão para assumir controle direto da conversa
  - Ignora alertas da conversa atualmente em visualização

### Chat em Tempo Real

O componente `RealTimeChat` gerencia comunicação bidirecional:

- **Recursos**:
  - Conexão WebSocket automática via `SocketManager` singleton
  - Indicador visual de status de conexão (verde/vermelho)
  - Prevenção de mensagens duplicadas com deduplicação
  - Indicador "Pensando..." quando IA está processando
  - Indicador "Digitando..." quando outro usuário está digitando
  - Mensagem pendente com animação enquanto envia
  - Auto-scroll para última mensagem
  - Formatação diferenciada por tipo de remetente (user/ai/monitor/system)
  - Ícone de alerta em mensagens flagadas

- **Eventos WebSocket**:
  - `join_conversation`: Entra no room da conversa
  - `send_message`: Envia mensagem
  - `new_message`: Recebe nova mensagem
  - `typing`: Notifica que está digitando
  - `user_typing`: Recebe notificação de digitação
  - `monitor_joined`: Notificação quando monitor entra
  - `message_updated`: Atualização de flags/risk_level

### Dashboard do Monitor

Recursos avançados do dashboard:

- **Detecção Automática de Novas Conversas**: Quando chega mensagem de conversa não listada, busca automaticamente as mensagens e adiciona à lista
- **Prevenção de Race Conditions**: Map de conversas em carregamento previne duplicatas
- **Filtros em Tempo Real**: Busca textual e filtros por status
- **WebSocket para Atualizações**: Lista atualiza automaticamente sem polling
- **Deep Linking**: Suporte a parâmetro `?conversation=ID` na URL para abrir conversa específica

### Gerenciamento de Sessões

- **Heartbeat para Usuários**: Ping a cada 30s mantém sessão ativa no backend
- **Autenticação JWT**: Token armazenado em localStorage
- **Interceptor Axios**: Adiciona automaticamente token em todas requisições
- **Reconexão Automática**: Socket.IO tenta reconectar automaticamente em caso de queda

## Arquitetura e Integrações

### REST API

Cliente Axios configurado em [lib/api.ts](src/lib/api.ts):

**authAPI**:

- `login(username, password)`: Autenticação de monitores

**chatAPI**:

- `createConversation(title)`: Cria nova conversa
- `getMessages(conversationId)`: Busca mensagens
- `sendMessage(conversationId, sender, text, sessionId)`: Envia mensagem (também via WebSocket)

**monitorAPI**:

- `getDashboard()`: Lista conversas ativas
- `takeControl(conversationId)`: Assume controle da conversa
- `escalateConversation(conversationId, reason)`: Escala manualmente
- `getFlaggedMessages(limit)`: Lista mensagens flagadas

### WebSocket

Gerenciador singleton em [lib/socket.ts](src/lib/socket.ts):

**Eventos Enviados**:

- `join_conversation`: Entra em room de conversa
- `join_monitor`: Entra em room de monitor (requer token)
- `leave_conversation`: Sai de room
- `send_message`: Envia mensagem
- `typing`: Notifica digitação
- `heartbeat`: Mantém sessão viva

**Eventos Recebidos**:

- `new_message`: Nova mensagem na conversa
- `crisis_alert`: Alerta de crise para monitores
- `monitor_joined`: Monitor entrou na conversa
- `message_updated`: Mensagem foi flagada/atualizada
- `user_typing`: Alguém está digitando

## Tipos TypeScript

As principais interfaces estão definidas em [types/index.ts](src/types/index.ts):

```typescript
interface Message {
  id: number
  sender: string              // 'user' | 'ai' | 'monitor' | 'system'
  text: string
  created_at: string
  session_id?: string
  flagged: boolean
  risk_level?: string         // 'low' | 'medium' | 'high' | 'critical'
  escalation_level?: string
  notified: boolean
  intervention_timestamp?: string
  extra_data?: Record<string, any>
}

interface Conversation {
  id: number
  title?: string
  mode: string                // 'user' | 'monitor'
  active: boolean
  status?: string             // 'active' | 'escalated'
  created_at?: string
  updated_at?: string
  messages: Message[]
}

interface CrisisAnalysis {
  risk_level: string
  confidence: number
  keywords_found: string[]
  requires_human: boolean
  emergency_contact: boolean
  analysis_details: Record<string, any>
}
```

## Rotas da Aplicação

- `/` - Chat do usuário (página principal)
- `/monitor/login` - Login de monitores
- `/monitor/dashboard` - Dashboard do monitor
- `/test-crisis` - Página de teste de alertas (desenvolvimento)

## Deploy

### Vercel (Recomendado)

```bash
# Build local
npm run build

# Deploy para Vercel
vercel --prod
```

Configure as variáveis de ambiente no painel da Vercel:

- `NEXT_PUBLIC_API_URL`: URL do backend em produção
- `NEXT_PUBLIC_SOCKET_URL`: URL do WebSocket em produção

### Build Manual

```bash
# Build
npm run build

# Servir em produção
npm start
```

A aplicação será servida na porta 3000.

### Docker

```bash
# Build da imagem
docker build -t checkpoint-frontend .

# Executar container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://seu-backend:8000 \
  -e NEXT_PUBLIC_SOCKET_URL=http://seu-backend:8000 \
  checkpoint-frontend
```

### Outras Plataformas

A aplicação é compatível com qualquer provedor que suporte Next.js 14:

- Netlify
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform

## Desenvolvimento

### Estrutura de Componentes

- **Componentes de Página** (`app/`): Componentes de rota do Next.js App Router
- **Componentes Reutilizáveis** (`components/`): Lógica de UI compartilhada
- **Componentes Base** (`components/ui/`): Primitivos de design system

### Padrões de Código

- **Client Components**: Todos os componentes que usam hooks ou interatividade têm `'use client'`
- **Server Components**: Por padrão no Next.js 14 App Router (quando aplicável)
- **Singleton Pattern**: `SocketManager` é singleton para evitar múltiplas conexões
- **Deduplicação**: Prevenção de mensagens e conversas duplicadas com verificações de ID

### Debugging

Console logs estão presentes para debugging de WebSocket:

- `🚪` Eventos de entrada/saída de rooms
- `📨` Mensagens recebidas
- `📤` Mensagens enviadas
- `🚨` Alertas de crise
- `✅` Operações bem-sucedidas
- `❌` Erros
- `⚠️` Avisos

Para desabilitar em produção, remova ou comente os `console.log`.

## Troubleshooting

### WebSocket não conecta

1. Verifique se backend está rodando
2. Confirme `NEXT_PUBLIC_SOCKET_URL` no `.env.local`
3. Verifique CORS no backend
4. Confira console do navegador para erros

### Mensagens duplicadas

- Sistema já possui deduplicação baseada em ID e timestamp
- Se persistir, verifique se há múltiplos listeners registrados

### Alertas não aparecem

1. Verifique se monitor está logado
2. Confirme que `monitorId` está sendo passado para `CrisisAlerts`
3. Verifique se monitor entrou no room correto (`join_monitor`)
4. Confira console para eventos `crisis_alert`

### Autenticação falha

1. Verifique credenciais no backend
2. Confirme que token está sendo salvo em `localStorage`
3. Verifique interceptor Axios em `lib/api.ts`
4. Token pode ter expirado - faça login novamente

## Próximos Passos

Melhorias sugeridas:

- [ ] Adicionar testes unitários (Jest + React Testing Library)
- [ ] Implementar testes E2E (Playwright ou Cypress)
- [ ] Adicionar suporte a múltiplos idiomas (i18n)
- [ ] Implementar dark mode
- [ ] Melhorar acessibilidade (ARIA labels, navegação por teclado)
- [ ] Adicionar métricas e analytics
- [ ] Implementar cache de mensagens com IndexedDB
- [ ] Adicionar suporte a anexos/imagens
- [ ] Implementar histórico de conversas para usuários
- [ ] Adicionar dashboard de métricas para monitores
