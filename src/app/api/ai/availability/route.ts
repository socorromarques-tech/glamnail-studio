import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.coerce.number().min(15).optional().default(60),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      date: searchParams.get("date"),
      duration: searchParams.get("duration"),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { date, duration } = result.data;

    const config = await prisma.businessConfig.findFirst();
    if (!config) {
      return NextResponse.json(
        { error: "Configuração do negócio não encontrada" },
        { status: 404 }
      );
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();
    const workDays = config.workDays.split(",").map(Number);

    if (!workDays.includes(dayOfWeek)) {
      return NextResponse.json({
        slots: [],
        message: "Não atendemos neste dia",
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ["CANCELLED"] },
      },
      select: { date: true, endTime: true },
    });

    const [openH, openM] = config.openTime.split(":").map(Number);
    const [closeH, closeM] = config.closeTime.split(":").map(Number);
    const slots: { time: string; available: boolean }[] = [];

    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      const isAvailable = !existing.some((apt) => {
        const aptStart = new Date(apt.date);
        const aptEnd = new Date(apt.endTime);
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      slots.push({
        time: `${Math.floor(currentMinutes / 60).toString().padStart(2, "0")}:${(currentMinutes % 60).toString().padStart(2, "0")}`,
        available: isAvailable,
      });

      currentMinutes += config.slotInterval;
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Erro ao buscar disponibilidade" },
      { status: 500 }
    );
  }
}
