import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clientSchema = z.object({
  phone: z.string().min(9),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { phone, name, email } = result.data;

    let client = await prisma.client.findFirst({
      where: { phone },
    });

    if (!client && name) {
      client = await prisma.client.create({
        data: {
          phone,
          name,
          email: email || undefined,
        },
      });
    }

    if (!client) {
      return NextResponse.json(
        { 
          error: "Cliente não encontrado",
          needsRegistration: true,
          message: "Por favor, forneça o seu nome para criar o seu cadastro."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  } catch (error) {
    console.error("Error processing client:", error);
    return NextResponse.json(
      { error: "Erro ao processar cliente" },
      { status: 500 }
    );
  }
}
