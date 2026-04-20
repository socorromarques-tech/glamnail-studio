name: intelligent-backend
description: "Prepara o backend do Next.js para fornecer todas as informações que a IA precisa (serviços, horários livres, clientes) através de um canal seguro e padronizado. Cria endpoints otimizados para consumo por agentes de IA."
version: "1.0.0"

triggers:
  - "backend inteligente"
  - "api para ia"
  - "endpoints para chatbot"
  - "dados para agente"
  - "preparar api para ia"

actions:
  - name: "create-ai-endpoints"
    description: "Cria endpoints REST otimizados para consumo por IA"
    files:
      - path: "src/app/api/ai/services/route.ts"
        description: "GET - Retorna lista de serviços com preços e duração"
      - path: "src/app/api/ai/availability/route.ts"
        description: "GET - Retorna horários disponíveis para uma data"
      - path: "src/app/api/ai/clients/route.ts"
        description: "POST - Busca ou cria cliente pelo telefone"
      - path: "src/app/api/ai/appointments/route.ts"
        description: "POST - Cria agendamento via API"

  - name: "create-ai-client"
    description: "Cria cliente helper para consumir API de IA"
    files:
      - path: "src/lib/ai-client.ts"
        description: "Cliente TypeScript para comunicar com endpoints de IA"

schema:
  endpoints:
    - path: "/api/ai/services"
      method: "GET"
      description: "Lista todos os serviços ativos"
      response: |
        {
          services: [
            { id, name, price, duration, description }
          ]
        }

    - path: "/api/ai/availability"
      method: "GET"
      query: |
        date: string (YYYY-MM-DD)
        duration: number (minutos)
      response: |
        {
          slots: [
            { time: "09:00", available: true },
            { time: "09:30", available: false }
          ]
        }

    - path: "/api/ai/clients"
      method: "POST"
      body: |
        { phone: string, name?: string, email?: string }
      response: |
        { client: { id, name, phone, email } }

    - path: "/api/ai/appointments"
      method: "POST"
      body: |
        {
          clientId: string,
          serviceIds: string[],
          date: string (YYYY-MM-DD),
          time: string (HH:MM),
          notes?: string
        }
      response: |
        {
          appointment: { id, date, status, totalPrice, services }
        }

security:
  - API key para endpoints de IA
  - Rate limiting
  - Validação de inputs com Zod
  - Logs de auditoria

dependencies:
  - zod
  - rate-limiter-flexible

notes: |
  Este skill prepara o backend para ser consumido por qualquer agente de IA,
  incluindo chatbots, assistentes de voz, e automações. Os dados são
  fornecidos em formato padronizado e seguro.
