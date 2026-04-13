import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyAppointmentEvent } from "@/lib/notifications";

const appointmentSchema = z.object({
  clientId: z.string(),
  serviceIds: z.array(z.string()).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = appointmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { clientId, serviceIds, date, time, notes } = result.data;

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "Alguns serviços não foram encontrados" },
        { status: 400 },
      );
    }

    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

    const dateTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(dateTime);
    endTime.setMinutes(endTime.getMinutes() + totalDuration);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicting = await prisma.appointment.findFirst({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ["CANCELLED"] },
        OR: [{ date: { lt: endTime }, endTime: { gt: dateTime } }],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "Horário não disponível. Por favor, escolha outro horário." },
        { status: 409 },
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        date: dateTime,
        endTime,
        totalPrice,
        notes,
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.price,
          })),
        },
      },
      include: {
        client: true,
        services: { include: { service: true } },
      },
    });

    const config = await prisma.businessConfig.findFirst();
    await notifyAppointmentEvent(
      "appointment.created",
      appointment,
      config?.businessName || "GlamNail Studio",
    );

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        time: `${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`,
        status: appointment.status,
        totalPrice: Number(appointment.totalPrice),
        services: appointment.services.map((s) => ({
          name: s.service.name,
          price: Number(s.price),
        })),
        client: {
          name: appointment.client.name,
          phone: appointment.client.phone,
        },
      },
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 },
    );
  }
}
