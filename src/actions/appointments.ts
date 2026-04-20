"use server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { revalidatePath } from "next/cache";
import { notifyAppointmentEvent } from "@/lib/notifications";
import { AppointmentStatus } from "@prisma/client";

export async function getAppointments(filters?: {
  date?: string;
  status?: AppointmentStatus;
  clientId?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.date) {
    const startDate = new Date(filters.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(filters.date);
    endDate.setHours(23, 59, 59, 999);
    where.date = { gte: startDate, lte: endDate };
  }
  if (filters?.status) where.status = filters.status;
  if (filters?.clientId) where.clientId = filters.clientId;

  const data = await prisma.appointment.findMany({
    where,
    include: {
      client: true,
      services: { include: { service: true } },
    },
    orderBy: { date: "asc" },
  });

  return serialize(data);
}

export async function getAppointment(id: string) {
  const data = await prisma.appointment.findUnique({
    where: { id },
    include: {
      client: true,
      services: { include: { service: true } },
    },
  });
  return serialize(data);
}

export async function getTodayAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const data = await prisma.appointment.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
    },
    include: {
      client: true,
      services: { include: { service: true } },
    },
    orderBy: { date: "asc" },
  });

  return serialize(data);
}

export async function createAppointment(data: {
  clientId: string;
  serviceIds: string[];
  date: Date;
  notes?: string;
}) {
  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds } },
  });

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

  const endTime = new Date(data.date);
  endTime.setMinutes(endTime.getMinutes() + totalDuration);

  const appointment = await prisma.appointment.create({
    data: {
      clientId: data.clientId,
      date: data.date,
      endTime,
      totalPrice,
      notes: data.notes,
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

  // Trigger notification
  await notifyAppointmentEvent(
    "appointment.created",
    appointment,
    "GlamNail Studio",
  );

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return serialize(appointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      client: true,
      services: { include: { service: true } },
    },
  });

  if (status === "CONFIRMED") {
    await notifyAppointmentEvent(
      "appointment.confirmed",
      appointment,
      "GlamNail Studio",
    );
  } else if (status === "CANCELLED") {
    await notifyAppointmentEvent(
      "appointment.cancelled",
      appointment,
      "GlamNail Studio",
    );
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return serialize(appointment);
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
}

export async function updateAppointment(
  id: string,
  data: {
    clientId: string;
    serviceIds: string[];
    date: Date;
    notes?: string;
  },
) {
  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds } },
  });

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

  const endTime = new Date(data.date);
  endTime.setMinutes(endTime.getMinutes() + totalDuration);

  await prisma.appointmentService.deleteMany({ where: { appointmentId: id } });

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      clientId: data.clientId,
      date: data.date,
      endTime,
      totalPrice,
      notes: data.notes,
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

  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  // Notify client of appointment reschedule
  await notifyAppointmentEvent(
    "appointment.created",
    appointment,
    "GlamNail Studio",
  );

  return serialize(appointment);
}

export async function getAvailableSlots(date: string, serviceIds: string[]) {
  try {
    const config = await prisma.businessConfig.findFirst();
    if (!config) {
      console.error("[getAvailableSlots] No config found");
      return [];
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length === 0) {
      console.error(
        "[getAvailableSlots] No services found for IDs:",
        serviceIds,
      );
      return [];
    }

    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const workDays = config.workDays.split(",").map(Number);

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();
    if (!workDays.includes(dayOfWeek)) return [];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ["CANCELLED"] },
      },
      orderBy: { date: "asc" },
    });

    const [openH, openM] = config.openTime.split(":").map(Number);
    const [closeH, closeM] = config.closeTime.split(":").map(Number);
    const slots: { time: string; available: boolean }[] = [];

    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    while (currentMinutes + totalDuration <= endMinutes) {
      const slotStart = new Date(date);
      slotStart.setHours(
        Math.floor(currentMinutes / 60),
        currentMinutes % 60,
        0,
        0,
      );
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);

      const isAvailable = !existing.some((apt) => {
        const aptStart = new Date(apt.date);
        const aptEnd = new Date(apt.endTime);
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      slots.push({
        time: `${Math.floor(currentMinutes / 60)
          .toString()
          .padStart(
            2,
            "0",
          )}:${(currentMinutes % 60).toString().padStart(2, "0")}`,
        available: isAvailable,
      });

      currentMinutes += config.slotInterval;
    }

    return slots;
  } catch (error) {
    console.error("[getAvailableSlots] Error:", error);
    return [];
  }
}
