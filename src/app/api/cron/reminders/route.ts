import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAppointmentEvent } from "@/lib/notifications";

// GET /api/cron/reminders
export async function GET(request: Request) {
  // Guard: validate cron secret
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Guard: warn if CRON_SECRET not configured
  if (!process.env.CRON_SECRET) {
    console.warn("[cron/reminders] CRON_SECRET is not set");
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 500 },
    );
  }

  // Get business name
  const businessConfig = await prisma.businessConfig.findFirst();
  const businessName = businessConfig?.businessName || "GlamNail Studio";

  // Calculate time window: now to 24 hours from now
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find appointments needing reminders
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: now,
        lte: in24Hours,
      },
      status: "CONFIRMED",
      reminderSent: false,
    },
    include: {
      client: true,
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  // Edge case: no appointments found
  if (appointments.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, errors: [] });
  }

  // Send reminders and track results
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const appointment of appointments) {
    try {
      await notifyAppointmentEvent(
        "appointment.reminder",
        appointment,
        businessName,
      );
      sent++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`appointment ${appointment.id}: ${message}`);
    } finally {
      // Always mark as sent to prevent endless retries
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { reminderSent: true },
      });
    }
  }

  return NextResponse.json({ sent, failed, errors });
}
