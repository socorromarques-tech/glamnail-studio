name: financial-reports-agent
description: "Implementa 'Pergunta Mágica' - permite consultar relatórios financeiros em linguagem natural. O admin pergunta 'Como foram as vendas esta semana?' e o sistema responde com dados formatados do Neon (banco de dados)."
version: "1.0.0"

triggers:
  - "relatórios financeiros"
  - "pergunta mágica"
  - "consultar vendas"
  - "relatório em linguagem natural"
  - "dashboard com ia"

actions:
  - name: "create-nlp-endpoint"
    description: "Cria endpoint para processar perguntas em linguagem natural"
    files:
      - path: "src/app/api/ai/reports/route.ts"
        description: "Endpoint que recebe pergunta e retorna resposta com dados"

  - name: "create-report-functions"
    description: "Cria funções para gerar diferentes tipos de relatórios"
    files:
      - path: "src/lib/reports/sales.ts"
        description: "Funções para relatório de vendas (diário, semanal, mensal)"
      - path: "src/lib/reports/services.ts"
        description: "Funções para ranking de serviços mais populares"
      - path: "src/lib/reports/clients.ts"
        description: "Funções para análise de clientes (novos, recorrentes)"

  - name: "create-report-prompt"
    description: "Cria prompt para interpretar perguntas e gerar respostas"
    files:
      - path: "src/lib/ai/report-prompt.ts"
        description: "Prompt do sistema para interpretar perguntas sobre finanças"

  - name: "create-reports-page"
    description: "Cria página de relatórios com chat interface"
    files:
      - path: "src/app/(admin)/reports/page.tsx"
        description: "Interface de chat para fazer perguntas sobre relatórios"
      - path: "src/components/admin/ReportChat.tsx"
        description: "Componente de chat para perguntar e ver respostas"

workflow:
  steps:
    - description: "Crie o endpoint de relatórios com IA"
      code: |
        # Implementar src/app/api/ai/reports/route.ts
        # - Receber pergunta em texto
        # - Identificar tipo de relatório (vendas, clientes, serviços)
        # - Consultar banco de dados via Prisma
        # - Formatar resposta em linguagem natural

    - description: "Crie funções de relatórios especializados"
      code: |
        # sales.ts: getDailySales, getWeeklySales, getMonthlySales
        # services.ts: getTopServices, getServicesByRevenue
        # clients.ts: getNewClients, getReturningClients

    - description: "Crie interface de chat no admin"
      code: |
        # Página /admin/reports com chat interface
        # Exemplos de perguntas:
        # - "Como foram as vendas esta semana?"
        # - "Quais são os serviços mais populares?"
        # - "Quantos novos clientes tivemos este mês?"

context:
  existing:
    - name: "Dashboard Actions"
      path: "src/actions/dashboard.ts"
      description: "Já tem funções de agregação que podem ser reaproveitadas"

examples:
  questions:
    - "Como foram as vendas esta semana?"
      response: |
        "Esta semana você atendeu 24 clientes, com um faturamento 
        total de €1.245,00. Comparado à semana passada, houve um 
        aumento de 15% nas vendas."

    - "Quais são os serviços mais populares?"
      response: |
        "Os 3 serviços mais realizados este mês são:
        1. Manicure Gel - 45 clientes
        2. Pedicure - 32 clientes  
        3. Nail Art - 28 clientes"

    - "Quantos novos clientes este mês?"
      response: |
        "Este mês você conquistou 12 novos clientes! 
        Desses, 8 já retornaram para um segundo agendamento."

dependencies:
  - openai (opcional - pode usar template strings para respostas)
  - date-fns (já existe)

notes: |
  Este skill adiciona uma interface de "pergunta mágica" onde o dono do salão
  pode perguntar sobre finanças em português e receber respostas com dados
  reais do banco de dados. Pode usar IA para formatação ou simplesmente
  template strings para simplicidade.
