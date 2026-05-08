import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "2026-05-20";
  const serviceIdsParam = searchParams.get("serviceIds");

  try {
    const config = await prisma.businessConfig.findFirst();

    // Get all services
    const allServices = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });

    // Determine service IDs to use
    let serviceIds: string[];
    if (serviceIdsParam) {
      serviceIds = serviceIdsParam.split(",");
    } else {
      // Use first service
      serviceIds = allServices.length > 0 ? [allServices[0].id] : [];
    }

    // Get services matching the IDs
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const workDays = config?.workDays.split(",").map(Number) || [];

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

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

    const [openH, openM] = (config?.openTime || "09:00").split(":").map(Number);
    const [closeH, closeM] = (config?.closeTime || "18:00")
      .split(":")
      .map(Number);

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

      currentMinutes += config?.slotInterval || 30;
    }

    return NextResponse.json({
      debug: true,
      date,
      dayOfWeek,
      dayName: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][dayOfWeek],
      workDays,
      isWorkDay: workDays.includes(dayOfWeek),
      config: {
        openTime: config?.openTime,
        closeTime: config?.closeTime,
        slotInterval: config?.slotInterval,
      },
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
      })),
      totalDuration,
      openMinutes: openH * 60 + openM,
      closeMinutes: endMinutes,
      existingAppointments: existing.length,
      slotsGenerated: slots.length,
      slots: slots.slice(0, 5), // First 5 only
    });
  } catch (error) {
    console.error("[Debug Slots]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
