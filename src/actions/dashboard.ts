"use server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function getDashboardStats() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [todayAppointments, weekAppointments, monthlyCompleted, totalClients, upcomingAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.appointment.count({
        where: { date: { gte: startOfWeek, lt: endOfWeek } },
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
          status: "COMPLETED",
        },
        select: { totalPrice: true },
      }),
      prisma.client.count(),
      prisma.appointment.findMany({
        where: {
          date: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: {
          client: true,
          services: { include: { service: true } },
        },
        orderBy: { date: "asc" },
        take: 5,
      }),
    ]);

  const monthRevenue = monthlyCompleted.reduce(
    (sum, a) => sum + Number(a.totalPrice),
    0
  );

  return serialize({
    todayAppointments,
    weekAppointments,
    monthRevenue,
    totalClients,
    upcomingAppointments,
  });
}

export async function getWeeklyChartData() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const days = [];
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await prisma.appointment.count({
      where: {
        date: { gte: dayStart, lt: dayEnd },
        status: { notIn: ["CANCELLED"] },
      },
    });

    days.push({ name: labels[i], appointments: count });
  }

  return days;
}
