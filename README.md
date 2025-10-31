# Checkpoint Frontend

Frontend da aplicação Checkpoint - Sistema de chatbot com detecção de crise e suporte humano.

## Funcionalidades

### Para Usuários
- **Chat com IA**: Interface amigável para conversar com o chatbot
- **Detecção de Crise**: Sistema automático que identifica sinais de risco
- **Escalação Automática**: Conversas são escaladas para monitores quando necessário
- **Interface Responsiva**: Funciona em desktop e mobile

### Para Monitores
- **Login Seguro**: Sistema de autenticação para monitores
- **Dashboard de Monitoramento**: Visão geral de todas as conversas ativas
- **Chat em Tempo Real**: Comunicação direta com usuários
- **Alertas de Crise**: Notificações automáticas para situações de risco
- **Gestão de Conversas**: Ferramenta para assumir controle e escalar conversas

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Socket.IO Client** - Comunicação em tempo real
- **Axios** - Cliente HTTP para API
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas

## Estrutura do Projeto

```
src/
├── app/                          # App Router do Next.js
│   ├── page.tsx                 # Chat principal do usuário
│   └── monitor/                 # Área do monitor
│       ├── login/page.tsx       # Login do monitor
│       ├── dashboard/page.tsx   # Dashboard do monitor
│       └── conversation/[id]/   # Chat individual
├── components/                  # Componentes reutilizáveis
│   ├── ui/                     # Componentes base (Button, Input)
│   ├── RealTimeChat.tsx        # Chat em tempo real
│   └── CrisisAlerts.tsx        # Alertas de crise
├── lib/                        # Utilitários e configurações
│   ├── api.ts                  # Cliente da API
│   ├── socket.ts               # Gerenciamento WebSocket
│   └── utils.ts                # Funções auxiliares
└── types/                      # Definições TypeScript
    └── index.ts                # Tipos da aplicação
```

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
```

### Configuração
Edite o arquivo `.env.local` com as URLs corretas:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### Execução
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

## Fluxo da Aplicação

### Usuário Regular
1. Acessa a página principal (`/`)
2. Inicia uma conversa com o chatbot
3. Sistema monitora automaticamente sinais de crise
4. Se detectado risco, conversa é escalada para monitor

### Monitor
1. Faz login em `/monitor/login`
2. Acessa dashboard em `/monitor/dashboard`
3. Visualiza conversas que precisam de atenção
4. Recebe alertas de crise em tempo real
5. Assume controle de conversas quando necessário
6. Conversa diretamente com usuários

## Principais Recursos

### Sistema de Alertas
- **Alertas de Baixo Risco**: Notificação visual
- **Alertas de Alto Risco**: Notificação + som
- **Emergências**: Notificação + som + popup

### Chat em Tempo Real
- Conexão WebSocket automática
- Indicadores de status de conexão
- Notificações quando monitor entra
- Indicador de digitação

### Responsividade
- Design mobile-first
- Interface adaptativa
- Componentes otimizados para touch

## API Integration

O frontend se conecta com o backend através de:

### REST API
- Autenticação de monitores
- CRUD de conversas e mensagens
- Dashboard de monitoramento

### WebSocket
- Chat em tempo real
- Alertas de crise
- Notificações de presença

## Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t checkpoint-frontend .
docker run -p 3000:3000 checkpoint-frontend
```

A aplicação é compatível com qualquer provedor que suporte Next.js.
