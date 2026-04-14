import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

  description: string | null;
  price: number;
  duration: number;
  color: string;
};

export type Slot = {
  time: string;
  available: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type AppointmentData = {
  clientId: string;
  serviceIds: string[];
  date: string;
  time: string;
  notes?: string;
};

const BUSINESS_INFO = `
Você é um assistente amigável do GlamNail Studio, um salão de manicure em Lisboa.

REGRAS IMPORTANTES:
1. Seja sempre simpática e profissional
2. Use emojis com moderação para tornar a conversa mais acolhedora
3. Responda em português de Portugal
4. Para agendar, precisa sempre de: nome, telefone, serviços, data e hora
5. Se faltar algum dado, peça gentilmente
6. Nunca invente informações - use apenas os dados fornecidos
7. Confirme sempre os detalhes antes de finalizar um agendamento

FLUXO DE AGENDAMENTO:
1. Pergunte quais serviços a cliente deseja
2. Pergunte qual a data preferida
3. Mostre os horários disponíveis
4. Peça o nome e telefone (se novo cliente)
5. Confirme e finalize o agendamento

SERVIÇOS DISPONÍVEIS: Use a tool get_services para obter a lista atual.
HORÁRIOS: Use a tool get_availability para ver horários livres.
CADASTRAR: Use a tool find_or_create_client para encontrar/criar cliente.
AGENDAR: Use a tool create_appointment para confirmar o agendamento.
`;

export function getSystemPrompt() {
  return BUSINESS_INFO;
}

export const tools = [
  {
    name: "get_services",
    description: "Obtém a lista de serviços disponíveis com preços e duração",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_availability",
    description: "Obtém os horários disponíveis para uma data específica",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Data no formato YYYY-MM-DD",
        },
        duration: {
          type: "number",
          description: "Duração total em minutos (padrão: 60)",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "find_or_create_client",
    description: "Encontra ou cria um cliente pelo número de telefone",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Número de telefone do cliente",
        },
        name: {
          type: "string",
          description: "Nome do cliente (obrigatório se novo cliente)",
        },
      },
      required: ["phone"],
    },
  },
  {
    name: "create_appointment",
    description: "Cria um agendamento no sistema",
    parameters: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "ID do cliente",
        },
        serviceIds: {
          type: "array",
          items: { type: "string" },
          description: "IDs dos serviços escolhidos",
        },
        date: {
          type: "string",
          description: "Data no formato YYYY-MM-DD",
        },
        time: {
          type: "string",
          description: "Hora no formato HH:MM",
        },
        notes: {
          type: "string",
          description: "Observações opcionais",
        },
      },
      required: ["clientId", "serviceIds", "date", "time"],
    },
  },
] as const;

export async function callTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  switch (toolName) {
    case "get_services": {
      const res = await fetch(`${baseUrl}/api/ai/services`);
      const data = await res.json();
      if (data.services) {
        return data.services
          .map(
            (s: Service) =>
              `• ${s.name}: ${s.price}€ (${s.duration} min)${s.description ? ` - ${s.description}` : ""}`,
          )
          .join("\n");
      }
      return "Não foi possível obter a lista de serviços.";
    }

    case "get_availability": {
      const { date, duration = 60 } = args;
      const res = await fetch(
        `${baseUrl}/api/ai/availability?date=${date}&duration=${duration}`,
      );
      const data = await res.json();
      if (data.slots) {
        const available = data.slots.filter((s: Slot) => s.available);
        if (available.length === 0) {
          return "Não há horários disponíveis para esta data.";
        }
        return `Horários disponíveis:\n${available.map((s: Slot) => `• ${s.time}`).join("\n")}`;
      }
      return data.message || "Não foi possível obter disponibilidade.";
    }

    case "find_or_create_client": {
      const { phone, name } = args;
      const res = await fetch(`${baseUrl}/api/ai/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });
      const data = await res.json();
      if (data.client) {
        return `Cliente encontrado: ${data.client.name} (${data.client.phone})`;
      }
      if (data.needsRegistration) {
        return "Cliente não encontrado. Por favor, forneça o nome completo para criar o cadastro.";
      }
      return "Erro ao processar cliente.";
    }

    case "create_appointment": {
      const res = await fetch(`${baseUrl}/api/ai/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        const apt = data.appointment;
        return `✅ Agendamento confirmado!

📅 Data: ${apt.date}
🕐 Hora: ${apt.time}
💅 Serviços: ${apt.services.map((s: { name: string }) => s.name).join(", ")}
💰 Total: ${apt.totalPrice}€

Até já! ✨`;
      }
      return data.error || "Erro ao criar agendamento.";
    }

    default:
      return "Tool não reconhecida.";
  }
}
