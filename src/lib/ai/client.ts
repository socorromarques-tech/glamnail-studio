import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "[getOpenAI] Missing OPENAI_API_KEY. AI features will be disabled.",
      );
      return null;
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export type Service = {
  id: string;
  name: string;
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
Você é a GlamAssistant, Atendimento do GlamNail Studio em Lisboa.

RESPONSABILIDADES:
1. saudar a cliente calorosamente
2. perguntar que serviço deseja (aplicação nova, manutenção, nail art)
3. verificar disponibilidade com get_availability
4. confirmar agendamento com create_appointment.

INSTRUÇÕES SIMPLES:
- Se cliente escolher номер (1, 2 ou 3), use esse valor para selecionar o serviço.
- Se cliente dizer "1" ou "nova aplicação" = primera opção.
- Se cliente dizer "2" ou "remoção" = segunda opção.
- Se cliente dizer "3" ou "manutenção" = terceira opção.

Após escolher serviço:
- "não consigo acessar links"
- perguntas sobre gel de outro salão (a menos que ela mencione)
- linguagem complexa

SERVICOS DISPONIVEIS: get_services (liste todos)
HORARIOS: get_availability (dia em formato YYYY-MM-DD)
AGENDAMENTO: create_appointment (clientId, serviceIds, date, time)
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
  host?: string,
): Promise<string> {
  const baseUrl = host
    ? `${host.startsWith("http") ? "" : "https://"}${host}`
    : process.env.NEXT_PUBLIC_BASE_URL ||
      "https://glamnail-studio-kappa.vercel.app";

  console.log(`[callTool] Executing ${toolName} via ${baseUrl}`);

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
      console.log(
        "[callTool] find_or_create_client args:",
        JSON.stringify(args),
      );

      // Validate args before sending
      if (!args.phone || !args.name) {
        console.log("[callTool] Missing required fields - phone or name");
        return "Por favor, forneça both o nome e o telefone no formato: NOMe : TELEFONE";
      }

      const { phone, name } = args;
      const res = await fetch(`${baseUrl}/api/ai/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });
      const data = await res.json();
      console.log("[callTool] /api/ai/clients response:", JSON.stringify(data));
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
