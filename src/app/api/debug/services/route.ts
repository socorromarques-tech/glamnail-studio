import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.businessConfig.findFirst();
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, duration: true },
    });

    return NextResponse.json({
      config,
      services,
      serviceIds: services.map((s) => s.id),
      workDays: config?.workDays,
    });
  } catch (error) {
    console.error("[Debug] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
