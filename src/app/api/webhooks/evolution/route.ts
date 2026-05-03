import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  processChat,
  sendWhatsAppMessage,
  conversationStore,
} from "@/lib/ai/chat";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(
      "[Evolution Webhook] Full Body:",
      JSON.stringify(body, null, 2),
    );
    console.log(
      "[Evolution Webhook] Received event:",
      body.event,
      "from:",
      body.data?.key?.remoteJid,
    );

    if (body.event !== "MESSAGES_UPSERT" && body.event !== "messages.upsert") {
      return NextResponse.json({ status: "ignored" });
    }

    const { key, message } = body.data || {};

    if (key?.fromMe) {
      return NextResponse.json({ status: "ignored" });
    }

    const text = message?.conversation || message?.extendedTextMessage?.text;
    if (!text) {
      return NextResponse.json({ status: "ignored" });
    }

    const remoteJid = key?.remoteJid || body.data?.remoteJid;
    if (!remoteJid) {
      return NextResponse.json({ status: "ignored", reason: "no jid" });
    }

    const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "");
    console.log("[Webhook] Phone extracted:", phone);
    console.log("[Webhook] Text received:", text);

    const response = await processChat(phone, text);
    console.log("[Webhook] AI Response:", response);

    if (response && key.remoteJid) {
      await sendWhatsAppMessage(key.remoteJid, response);
    }

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
