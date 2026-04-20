name: ai-booking-agent
description: "Implementa o Agente de Agendamento & Suporte com IA para o GlamNail Studio. Este agente transforma o webhook simples em um chatbot inteligente que conversa com clientes via WhatsApp, consulta preços, verifica horários disponíveis e realiza agendamentos automaticamente."
version: "1.0.0"

triggers:
  - "implementar agente de agendamento"
  - "chatbot para clientes"
  - "agente de suporte com IA"
  - "whatsapp bot"
  - "integrar openai"

actions:
  - name: "create-ai-chatbot-endpoint"
    description: "Cria endpoint de API para o chatbot de IA"
    files:
      - path: "src/app/api/ai/chat/route.ts"
        description: "Endpoint principal do chatbot que processa mensagens e retorna respostas inteligentes"

  - name: "create-prompt-engine"
    description: "Cria o motor de prompts para o agente"
    files:
      - path: "src/lib/ai/prompt.ts"
        description: "Prompt do sistema com contexto do salão (serviços, horários, regras de negócio)"
      - path: "src/lib/ai/tools.ts"
        description: "Funções tools que a IA pode chamar (consultar preços, horários, criar agendamento)"

  - name: "create-booking-by-chat"
    description: "Cria função para criar agendamento via chat"
    files:
      - path: "src/actions/ai-booking.ts"
        description: "Server action para criar agendamento via conversa"

  - name: "create-whatsapp-integration"
    description: "Cria integração com WhatsApp via webhook"
    files:
      - path: "src/app/api/webhooks/whatsapp/route.ts"
        description: "Webhook para receber mensagens do WhatsApp e responder com IA"

workflow:
  steps:
    - description: "Configure a API key da OpenAI no .env"
      command: |
        # Adicionar ao .env:
        # OPENAI_API_KEY=sk-...
        # AI_SYSTEM_PROMPT="Você é um assistente amigável do GlamNail Studio..."

    - description: "Crie o endpoint de chat da IA"
      code: |
        # Implementar src/app/api/ai/chat/route.ts
        # - Receber mensagem do usuário
        # - Consultar contexto (serviços, horários, clientes)
        # - Gerar resposta com OpenAI
        # - Executar tools quando necessário (criar agendamento)

    - description: "Configure o webhook do WhatsApp no n8n"
      code: |
        # No n8n, criar workflow que:
        # 1. Recebe mensagem do WhatsApp Business API
        # 2. Envia para /api/ai/chat
        # 3. Retorna resposta ao cliente

context:
  services:
    - name: "Services"
      path: "src/actions/services.ts"
    - name: "Appointments"
      path: "src/actions/appointments.ts"
    - name: "Business Config"
      path: "src/actions/settings.ts"

dependencies:
  - openai
  - zod

notes: |
  Este agente permite que clientes façam agendamentos conversando naturalmente
  pelo WhatsApp. A IA conhece todos os serviços, preços, horários e pode
  criar agendamentos automaticamente.
