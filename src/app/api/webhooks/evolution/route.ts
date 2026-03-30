import { NextResponse } from "next/server";
import { openai, getSystemPrompt, tools, callTool } from "@/lib/ai/client";

interface EvolutionWebhookPayload {
  event: "MESSAGES_UPSERT";
  session: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id?: string;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text?: string;
      };
    };
    pushName?: string;
  };
}

const conversationStore = new Map<string, Array<{ role: "user" | "assistant"; content: string }>>();

async function processChat(phone: string, message: string) {
  const history = conversationStore.get(phone) || [];

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: getSystemPrompt() },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools: tools.map((t) => ({
      type: "function" as const,
      function: { name: t.name, description: t.description, parameters: t.parameters },
    })),
    tool_choice: "auto",
    temperature: 0.7,
  });

  const choice = response.choices[0];
  const toolCalls = choice.message?.tool_calls || [];
  let finalResponse = choice.message?.content || "";

  for (const toolCall of toolCalls as Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>) {
    const args = JSON.parse(toolCall.function.arguments);
    finalResponse = await callTool(toolCall.function.name, args);
  }

  history.push({ role: "user", content: message });
  history.push({ role: "assistant", content: finalResponse });
  if (history.length > 20) history.splice(0, 2);
  conversationStore.set(phone, history);

  return finalResponse;
}

async function sendWhatsAppMessage(instanceName: string, instanceToken: string, remoteJid: string, text: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionToken = process.env.EVOLUTION_API_TOKEN;

  if (!evolutionUrl || !evolutionToken) {
    console.error("Evolution API not configured");
    return false;
  }

  try {
    const response = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionToken,
      },
      body: JSON.stringify({
        number: remoteJid.replace("@s.whatsapp.net", ""),
        text,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
    }

    const body: EvolutionWebhookPayload = await request.json();

    if (body.event !== "MESSAGES_UPSERT") {
      return NextResponse.json({ status: "ignored" });
    }

    const { key, message } = body.data;

    if (key.fromMe) {
      return NextResponse.json({ status: "ignored" });
    }

    const text = message?.conversation || message?.extendedTextMessage?.text;
    if (!text) {
      return NextResponse.json({ status: "ignored" });
    }

    const phone = key.remoteJid.replace("@s.whatsapp.net", "");
    const response = await processChat(phone, text);

    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || "glamnail";
    await sendWhatsAppMessage(instanceName, "", key.remoteJid, response);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Evolution webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  if (phone) conversationStore.delete(phone);
  return NextResponse.json({ success: true });
}
