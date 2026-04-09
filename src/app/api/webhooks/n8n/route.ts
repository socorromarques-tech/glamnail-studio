import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai, getSystemPrompt, tools, callTool } from "@/lib/ai/client";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "get-today-appointments": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await prisma.appointment.findMany({
          where: { date: { gte: today, lt: tomorrow } },
          include: { client: true, services: { include: { service: true } } },
          orderBy: { date: "asc" },
        });
        return NextResponse.json({ success: true, appointments });
      }
      case "send-reminder": {
        if (data?.appointmentId) {
          const appointment = await prisma.appointment.findUnique({
            where: { id: data.appointmentId },
            include: { client: true, services: { include: { service: true } } },
          });
          return NextResponse.json({ success: true, appointment });
        }
        return NextResponse.json({ success: false, error: "Missing appointmentId" }, { status: 400 });
      }
      case "get-services": {
        const services = await prisma.service.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ success: true, services });
      }
      case "get-available-slots": {
        const { date, serviceIds } = data || {};
        if (!date || !serviceIds || !Array.isArray(serviceIds)) {
          return NextResponse.json({ success: false, error: "Missing date or serviceIds" }, { status: 400 });
        }
        
        const { getAvailableSlots } = await import("@/actions/appointments");
        const slots = await getAvailableSlots(date, serviceIds);
        return NextResponse.json({ success: true, slots });
      }
      case "create-appointment": {
        const { clientId, serviceIds, date, notes } = data || {};
        if (!clientId || !serviceIds || !date) {
          return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const { createAppointment } = await import("@/actions/appointments");
        const appointment = await createAppointment({
          clientId,
          serviceIds,
          date: new Date(date),
          notes,
        });
        return NextResponse.json({ success: true, appointment });
      }
      case "whatsapp-message": {
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
        }
        const { phone, message } = data;
        if (!phone || !message) {
          return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
        }
        const response = await processChat(phone, message);
        return NextResponse.json({ success: true, response });
      }
      case "clear-conversation": {
        const { phone } = data;
        if (phone) conversationStore.delete(phone);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "GlamNail Studio n8n Webhook" });
}
