import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        color: true,
      },
      orderBy: { name: "asc" },
    });

    const serializedServices = services.map((s) => ({
      ...s,
      price: Number(s.price),
    }));

    return NextResponse.json({ services: serializedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}
