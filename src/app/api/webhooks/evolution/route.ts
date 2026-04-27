import { prisma } from "@/lib/prisma";
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
  
    // TRACER: Capture incoming payload structure safely
    try {
      const payloadString = JSON.stringify(body);
      console.log("[Webhook Tracer] Raw Payload:", payloadString);
    } catch (e) {}


    console.log("[Evolution Webhook] Received event:", body.event, "from:", body.data?.key?.remoteJid);

    if (body.event !== "MESSAGES_UPSERT") {
      return NextResponse.json({ status: "ignored" });
    }

    const { key, message } = body.data;

    if (key.fromMe) {
      return NextResponse.json({ status: "ignored" });
    }

    const text = message?.conversation || message?.extendedTextMessage?.text || (message as any)?.message?.conversation || (message as any)?.message?.extendedTextMessage?.text;
    if (!text) {
      return NextResponse.json({ status: "ignored" });
    }

    const remoteJid = key?.remoteJid || (body.data as any)?.remoteJid; if (!remoteJid) return NextResponse.json({ status: "ignored", reason: "no jid" }); const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "");
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
