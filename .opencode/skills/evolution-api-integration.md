name: evolution-api-integration
description: "Integração com Evolution API v2 para WhatsApp AI Chatbot. Recebe mensagens do WhatsApp via webhook, processa com IA e responde automaticamente."
version: "1.0.0"

triggers:
  - "evolution api"
  - "whatsapp chatbot"
  - "integrar whatsapp"
  - "evolution api v2"

files:
  - path: "src/app/api/webhooks/evolution/route.ts"
    description: "Webhook endpoint que recebe mensagens do WhatsApp via Evolution API"
  - path: "src/lib/ai/client.ts"
    description: "Cliente OpenAI com tools para serviços, horários e agendamentos"

environment:
  - name: "EVOLUTION_API_URL"
    description: "URL base da Evolution API"
    example: "https://api.seudominio.com"
  - name: "EVOLUTION_API_TOKEN"
    description: "Token de API da Evolution"
  - name: "EVOLUTION_INSTANCE_NAME"
    description: "Nome da instância do WhatsApp"
    example: "glamnail"

setup:
  - description: "Configure o webhook no painel da Evolution API"
    code: |
      # No painel da Evolution API, configure:
      # Webhook URL: https://seu-dominio.com/api/webhooks/evolution
      # Eventos: MESSAGES_UPSERT

  - description: "Configure as variáveis de ambiente"
    code: |
      # .env
      EVOLUTION_API_URL=https://api.seu-dominio.com
      EVOLUTION_API_TOKEN=seu-token-aqui
      EVOLUTION_INSTANCE_NAME=glamnail

notes: |
  A Evolution API v2 gerencia a conexão WhatsApp e envia as mensagens
  recebidas para o webhook. O Next.js processa com OpenAI e retorna
  a resposta, que é enviada de volta via Evolution API.
