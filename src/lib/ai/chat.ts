import { getOpenAI, getSystemPrompt, tools, callTool } from "@/lib/ai/client";

type ConversationEntry = { role: "user" | "assistant"; content: string };

/**
 * Module-level singleton for conversation history, keyed by phone number.
 * Persists across requests within the same server instance.
 */
export const conversationStore = new Map<string, ConversationEntry[]>();

const MAX_HISTORY_MESSAGES = 20;

export async function sendWhatsAppMessage(
  remoteJid: string,
  text: string,
): Promise<boolean> {
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiToken = process.env.EVOLUTION_API_TOKEN;

  if (!instanceName || !apiUrl || !apiToken) {
    console.error("[sendWhatsAppMessage] Missing environment variables");
    return false;
  }

  try {
    const url = `${apiUrl}/message/sendText/${instanceName}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiToken,
      },
      body: JSON.stringify({
        number: remoteJid,
        text,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("[sendWhatsAppMessage] Error sending message:", error);
    return false;
  }
}

export async function processChat(
  phone: string,
  message: string,
): Promise<string> {
  // Guard clause: early exit for invalid inputs
  if (!phone?.trim()) {
    throw new Error("Phone number is required");
  }
  if (!message?.trim()) {
    throw new Error("Message cannot be empty");
  }

  // Get or create conversation history for this phone
  const history = conversationStore.get(phone) ?? [];

  // Build messages array: system prompt + history + new user message
  const systemPrompt = getSystemPrompt();
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  // Call OpenAI with tools
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools: tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    })),
    tool_choice: "auto",
  });

  const choice = completion.choices[0];
  if (!choice) {
    throw new Error("No completion choice returned from OpenAI");
  }

  let finalText = "";
  const assistantMessage = choice.message;

  // Handle tool calls if present
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolResults = await Promise.all(
      assistantMessage.tool_calls.map(async (toolCall) => {
        const fn = toolCall as {
          function: { name: string; arguments: string };
          id: string;
        };
        const toolName = fn.function.name;
        const toolArgs = JSON.parse(fn.function.arguments) as Record<
          string,
          unknown
        >;
        const result = await callTool(toolName, toolArgs);
        return { toolCallId: fn.id, result };
      }),
    );

    // Add assistant message with tool calls, then tool results, then get final response
    const assistantMsgForHistory = {
      role: "assistant" as const,
      content: assistantMessage.content ?? "",
      tool_calls: assistantMessage.tool_calls,
    };

    const messagesWithToolCalls: Array<{
      role: "system" | "user" | "assistant" | "tool";
      content: string;
      tool_call_id?: string;
    }> = [
      ...messages,
      assistantMsgForHistory as { role: "assistant"; content: string },
      ...toolResults.map((tr) => ({
        role: "tool" as const,
        content: tr.result,
        tool_call_id: tr.toolCallId,
      })),
    ];

    const finalCompletion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messagesWithToolCalls as any,
    });

    finalText = finalCompletion.choices[0]?.message?.content ?? "";
  } else {
    finalText = assistantMessage.content ?? "";
  }

  // Update history: append user message and assistant response
  const updatedHistory: ConversationEntry[] = [
    ...history,
    { role: "user", content: message },
    { role: "assistant", content: finalText },
  ];

  // Enforce FIFO limit: keep most recent MAX_HISTORY_MESSAGES
  const trimmedHistory =
    updatedHistory.length > MAX_HISTORY_MESSAGES
      ? updatedHistory.slice(-MAX_HISTORY_MESSAGES)
      : updatedHistory;

  conversationStore.set(phone, trimmedHistory);

  return finalText;
}
