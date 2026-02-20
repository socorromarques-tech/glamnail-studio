import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
