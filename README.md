# Checkpoint - Sistema de Apoio Emocional Digital

> **Chatbot com IA e Suporte Humano para Pessoas em Vulnerabilidade**

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Contexto e Justificativa](#-contexto-e-justificativa)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Requisitos](#-requisitos)
- [Autor](#-autor)

---

## 🎯 Sobre o Projeto

**Checkpoint** é uma plataforma digital de escuta ativa e acolhimento emocional, desenvolvida como Trabalho de Conclusão de Curso em Engenharia de Software na Católica de Santa Catarina. O sistema oferece apoio imediato, anônimo e empático para pessoas em situação de vulnerabilidade emocional.

### 💡 Conceito

Inspirado na ideia de um **"salva-vidas digital"**, o Checkpoint funciona como um ponto de parada seguro — assim como nos jogos ou na vida, onde é possível respirar, refletir e receber ajuda para continuar. O nome simboliza exatamente isso: um momento de acolhimento na jornada emocional de alguém.

### 🎯 Diferenciais

- **Empatia**: IA treinada com diretrizes psicológicas para interações humanizadas
- **Anonimato Total**: Sem coleta de dados pessoais ou autenticação
- **Detecção de Risco**: Sistema automático identifica sinais de crise
- **Escalação Inteligente**: Transferência automática para monitor humano em situações críticas
- **Interface Acolhedora**: Design focado em transmitir calma e segurança

---

## 🌍 Contexto e Justificativa

### Contexto

O projeto surge em um cenário onde cresce a busca por canais de apoio acessíveis, seguros e humanizados, especialmente diante do aumento dos casos de sofrimento psíquico. A demanda por experiências de suporte emocional imediatas, anônimas e confiáveis reforça a importância de soluções que combinem tecnologia e sensibilidade.

### Justificativa Técnica

A relevância para a Engenharia de Software está na **aplicação ética e inovadora** de tecnologias de IA para enfrentar desafios críticos na saúde mental e no acolhimento digital. O projeto explora:

- Uso responsável de IA conversacional
- Detecção de risco em tempo real
- Integração fluida entre automação e intervenção humana
- Arquitetura escalável com Clean Architecture e Modelo C4

---

## ✨ Funcionalidades

### Para Usuários

- 💬 **Chat em Tempo Real**: Conversa via WebSocket com resposta imediata
- 🤖 **IA Empática**: Respostas baseadas em diretrizes psicológicas
- 🚨 **Detecção Automática de Crise**: Monitoramento contínuo de sinais de risco
- 🔄 **Escalação Automática**: Transferência para monitor humano quando necessário
- 🔒 **Anonimato Garantido**: Nenhum dado pessoal coletado
- 📱 **Interface Responsiva**: Design mobile-first para todos dispositivos
- ⌨️ **Feedback Visual**: Indicadores de digitação e status de conexão
- 💓 **Sessão Ativa**: Sistema de heartbeat mantém conversa estável

### Para Monitores

- 🔐 **Autenticação Segura**: Sistema JWT para acesso administrativo
- 📊 **Dashboard em Tempo Real**: Visão completa de todas conversas ativas
- 🔔 **Sistema de Alertas**: Notificações sonoras e visuais baseadas em níveis de risco
  - 🟡 **Low**: Notificação visual amarela
  - 🟠 **Medium**: Notificação visual laranja
  - 🔴 **High**: Notificação vermelha + som
  - 🚨 **Critical**: Notificação pulsante + som + auto-expansão
- 💬 **Chat Bidirecional**: Comunicação direta com usuários
- 🎛️ **Controle Total**: Capacidade de assumir conversa e desativar IA
- 🔍 **Filtros Avançados**: Busca e filtros por status (ativas, escaladas, flagadas)
- 🖥️ **Notificações Desktop**: Alertas do navegador para situações críticas
- 🆕 **Detecção Automática**: Novas conversas aparecem automaticamente

---

## 🏗️ Arquitetura

### Clean Architecture

O projeto segue os princípios da **Clean Architecture**, garantindo:

- ✅ Separação clara de responsabilidades
- ✅ Independência entre camadas
- ✅ Fácil manutenção e testabilidade
- ✅ Baixo acoplamento, alta coesão

**Camadas:**

1. **Entidades** (Entities): Regras de negócio centrais
2. **Casos de Uso** (Use Cases): Lógica de aplicação
3. **Interfaces** (Interface Adapters): Comunicação com camadas externas
4. **Infraestrutura** (Frameworks e Drivers): Detalhes técnicos

### Modelo C4

O sistema é documentado usando o **Modelo C4** para visualização arquitetural:

#### Nível 1 - Contexto

```
┌─────────┐          ┌──────────────┐          ┌─────────┐
│ Usuário │────────▶│  Checkpoint  │◀─────────│ Monitor │
└─────────┘          └──────────────┘          └─────────┘
                            │
                            ▼
                      ┌──────────┐
                      │ API + IA │
                      └──────────┘
```

#### Nível 2 - Containers

```
┌────────────────────────────────────────────────────────┐
│                    Sistema Checkpoint                   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │   Painel     │ │
│  │   Next.js    │◀─│   Python     │─▶│ Monitores    │ │
│  │  (WebSocket) │  │     + IA     │  │   (Admin)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Next.js** | 14.2 | Framework React com App Router |
| **TypeScript** | 5.0 | Tipagem estática |
| **Tailwind CSS** | 3.4 | Estilização utilitária |
| **Socket.IO Client** | 4.8 | Comunicação em tempo real |
| **Axios** | 1.7 | Cliente HTTP |
| **Lucide React** | - | Biblioteca de ícones |
| **Date-fns** | 4.1 | Manipulação de datas |

### Backend

| Tecnologia | Uso |
|-----------|-----|
| **Python** | 3.11+ |
| **IA/NLP** | Processamento de linguagem natural |
| **WebSocket** | Comunicação em tempo real |

### Ferramentas de Desenvolvimento

- **Controle de Versão**: GitHub
- **Gestão de Projeto**: Trello
- **Análise Estática**: ESLint (Frontend), Flake8 (Backend)
- **Testes**: Vitest (Frontend), Pytest (Backend)

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ ou 20+
- npm ou yarn
- Backend Checkpoint rodando (padrão: `http://localhost:8000`)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/checkpoint-frontend.git
cd checkpoint/frontend
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### 4. Execute o Projeto

**Modo Desenvolvimento:**
```bash
npm run dev
# ou
yarn dev
```

**Build para Produção:**
```bash
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                          # App Router do Next.js
│   │   ├── page.tsx                 # Chat principal (usuário)
│   │   ├── layout.tsx               # Layout global
│   │   ├── globals.css              # Estilos globais Tailwind
│   │   ├── test-crisis/             # Página de teste de alertas
│   │   │   └── page.tsx
│   │   └── monitor/                 # Área administrativa
│   │       ├── login/page.tsx       # Login JWT
│   │       └── dashboard/page.tsx   # Dashboard de monitores
│   │
│   ├── components/                  # Componentes React
│   │   ├── ui/                      # Componentes base
│   │   │   ├── button.tsx
│   │   │   └── input.tsx
│   │   ├── RealTimeChat.tsx         # Chat WebSocket
│   │   ├── CrisisAlerts.tsx         # Widget de alertas
│   │   └── TestCrisis.tsx           # Teste de alertas
│   │
│   ├── lib/                         # Utilitários
│   │   ├── api.ts                   # Cliente Axios
│   │   ├── socket.ts                # SocketManager (singleton)
│   │   └── utils.ts                 # Funções auxiliares
│   │
│   └── types/                       # Definições TypeScript
│       └── index.ts                 # Interfaces (Message, Conversation)
│
├── public/                          # Arquivos estáticos
├── .env.local                       # Variáveis de ambiente
├── next.config.js                   # Configuração Next.js
├── tailwind.config.js               # Configuração Tailwind
├── tsconfig.json                    # Configuração TypeScript
└── package.json                     # Dependências
```

---

## 📋 Requisitos

### Requisitos Funcionais (RF)

| ID | Descrição |
|----|-----------|
| RF01 | Chatbot desenvolvido em Python com interação empática |
| RF02 | Frontend em Next.js com interface responsiva |
| RF03 | Iniciar conversa sem autenticação |
| RF04 | Solicitar atendimento humano a qualquer momento |
| RF05 | IA detecta sinais de risco automaticamente |
| RF06 | Monitor visualiza todos os chats em andamento |
| RF07 | Monitor assume controle da conversa |
| RF08 | Chatbot envia mensagens de apoio (técnicas de relaxamento, etc) |
| RF09 | Substituição automática IA → Humano em alto risco |
| RF10 | IA opera com base em diretrizes psicológicas |

### Requisitos Não Funcionais (RNF)

| ID | Descrição |
|----|-----------|
| RNF01 | Nenhum dado pessoal armazenado (anonimato total) |
| RNF02 | Sem sistema de autenticação de usuários |
| RNF03 | Tempo de resposta curto para manter engajamento |
| RNF04 | Interface clara e acolhedora |
| RNF05 | Tom empático, acessível e não julgador |
| RNF06 | Chatbot não emite diagnósticos médicos |
| RNF07 | Sem gamificação ou elementos de prolongamento |
| RNF08 | Sem responsabilidade legal por ações de usuários |

---

## 🔌 Integrações

### REST API

**Autenticação:**
- `POST /auth/login` - Login de monitores

**Chat:**
- `POST /conversations` - Criar nova conversa
- `GET /conversations/:id/messages` - Buscar mensagens
- `POST /messages` - Enviar mensagem

**Monitor:**
- `GET /monitor/dashboard` - Listar conversas ativas
- `POST /monitor/take-control/:id` - Assumir controle
- `POST /monitor/escalate/:id` - Escalar manualmente
- `GET /monitor/flagged-messages` - Mensagens flagadas

### WebSocket

**Eventos Enviados:**
- `join_conversation` - Entra no room da conversa
- `join_monitor` - Entra no room de monitor (requer token)
- `leave_conversation` - Sai do room
- `send_message` - Envia mensagem
- `typing` - Notifica digitação
- `heartbeat` - Mantém sessão ativa

**Eventos Recebidos:**
- `new_message` - Nova mensagem na conversa
- `crisis_alert` - Alerta de crise para monitores
- `monitor_joined` - Monitor entrou na conversa
- `message_updated` - Mensagem flagada/atualizada
- `user_typing` - Alguém está digitando

---

## 💡 Destaques Técnicos

### 1. Singleton Pattern
`SocketManager` único para evitar múltiplas conexões WebSocket

### 2. Deduplicação
Prevenção de mensagens e conversas duplicadas com verificação de ID

### 3. Gerenciamento de Estado
React hooks com TypeScript para type safety

### 4. Interceptors
Axios configurado com autenticação automática via JWT

### 5. Heartbeat
Sistema de keep-alive para manter sessões ativas

### 6. Reconexão Automática
Socket.IO com retry logic em caso de queda

### 7. Client/Server Components
Separação clara entre componentes cliente e servidor no Next.js 14

### 8. Type Safety
TypeScript completo em todo o projeto

---

## 🎨 Design e UX

### Princípios de Design

- **Acolhedor**: Cores suaves, elementos visuais que transmitem calma
- **Minimalista**: Interface limpa sem distrações
- **Responsivo**: Mobile-first, funciona em todos dispositivos
- **Acessível**: Boas práticas de acessibilidade web

### Experiência do Usuário

- **Sem Barreiras**: Nenhum cadastro ou login necessário
- **Feedback Constante**: Indicadores visuais de status e ações
- **Resposta Rápida**: Sistema otimizado para baixa latência
- **Empatia Visual**: Design que transmite segurança e acolhimento

---

## 🧪 Testes

```bash
# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint

# Testes unitários (quando implementados)
npm run test
```

---

## 📦 Deploy

### Vercel (Recomendado)

```bash
# Build local
npm run build

# Deploy
vercel --prod
```

**Variáveis de Ambiente:**
- `NEXT_PUBLIC_API_URL`: URL do backend em produção
- `NEXT_PUBLIC_SOCKET_URL`: URL do WebSocket em produção

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

---

## 🎓 Autor

**Arthur Hoengen**

Desenvolvedor Full Stack | Engenharia de Software
Católica de Santa Catarina - Jaraguá do Sul

[![GitHub](https://img.shields.io/badge/GitHub-Seguir-black)](https://github.com/ArthurHoengen)
[![Email](https://img.shields.io/badge/Email-Contato-red)](mailto:arthurhoengen@gmail.com)

---

## 📄 Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso e está disponível sob a licença MIT.

---

## ⚠️ Nota Importante

O Checkpoint é uma ferramenta de **acolhimento inicial** e **não substitui** o acompanhamento profissional de saúde mental. Em situações de emergência, procure sempre um profissional qualificado ou ligue para serviços de apoio como:

- **CVV**: 188 (Centro de Valorização da Vida)
- **SAMU**: 192
- **Emergência**: 190 ou 193

---

## 🙏 Agradecimentos

- Católica de Santa Catarina
- Orientadores do curso de Engenharia de Software
- Comunidade open source das tecnologias utilizadas

---

<div align="center">

**Desenvolvido com 💙 para fazer a diferença**

*Um checkpoint seguro na jornada emocional*

</div>
