# GlamNail Studio - Skills

Skills sugeridas pelo Amigo Antigravit para potencializar o GlamNail Studio.

## 📋 Skills Criadas

### 1. `ai-booking-agent.md`
**Agente de Agendamento & Suporte com IA**

Transforma o webhook simples em um chatbot inteligente que:
- Conversa com clientes via WhatsApp
- Consulta preços e serviços
- Verifica horários disponíveis
- Cria agendamentos automaticamente

### 2. `intelligent-backend.md`
**Backend Inteligente**

Prepara o Next.js para fornecer dados à IA através de endpoints seguros:
- `/api/ai/services` - Lista de serviços
- `/api/ai/availability` - Horários disponíveis
- `/api/ai/clients` - Busca/cria clientes
- `/api/ai/appointments` - Cria agendamentos

### 3. `financial-reports-agent.md`
**Relatórios Financeiros com "Pergunta Mágica"**

Permite consultar dados financeiros em linguagem natural:
- "Como foram as vendas esta semana?"
- "Quais são os serviços mais populares?"
- "Quantos novos clientes este mês?"

## 🚀 Como Usar

```bash
# Para implementar uma skill, carregue-a no opencode:
/skill ai-booking-agent
/skill intelligent-backend
/skill financial-reports-agent
```

## 📁 Estrutura de Arquivos que Serão Criados

```
src/
├── app/api/ai/
│   ├── chat/route.ts          # Chatbot de IA
│   ├── services/route.ts     # Endpoints de serviços
│   ├── availability/route.ts  # Endpoints de disponibilidade
│   ├── clients/route.ts       # Endpoints de clientes
│   ├── appointments/route.ts  # Endpoints de agendamentos
│   └── reports/route.ts       # Relatórios em linguagem natural
├── actions/
│   └── ai-booking.ts          # Server actions para IA
├── lib/
│   ├── ai/
│   │   ├── prompt.ts          # Prompt do sistema
│   │   ├── tools.ts           # Tools para IA
│   │   └── report-prompt.ts   # Prompt de relatórios
│   ├── ai-client.ts           # Cliente para API de IA
│   └── reports/
│       ├── sales.ts           # Relatórios de vendas
│       ├── services.ts        # Relatórios de serviços
│       └── clients.ts         # Relatórios de clientes
├── components/admin/
│   └── ReportChat.tsx         # Interface de chat
└── app/(admin)/reports/
    └── page.tsx               # Página de relatórios
```

## 🔧 Dependências Necessárias

```bash
npm install openai zod rate-limiter-flexible
```

## 📝 Variáveis de Ambiente

```env
# Para AI Booking Agent
OPENAI_API_KEY=sk-...

# Para Intelligent Backend
AI_API_KEY=your-secure-api-key

# Para Financial Reports (opcional)
OPENAI_API_KEY=sk-...  # Para formatação mais natural
```

---

*Skills sugeridas pelo **Amigo Antigravit*** 🤖✨
