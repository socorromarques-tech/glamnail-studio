import { NextResponse } from "next/server";
import {
  processChat,
  sendWhatsAppMessage,
  conversationStore,
} from "@/lib/ai/chat";

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

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI not configured" },
        { status: 500 },
      );
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

    await sendWhatsAppMessage(key.remoteJid, response);

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
