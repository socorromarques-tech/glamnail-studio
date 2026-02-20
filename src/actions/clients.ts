"use server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { revalidatePath } from "next/cache";

export async function getClients(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const data = await prisma.client.findMany({
    where,
    include: {
      appointments: {
        orderBy: { date: "desc" },
        take: 5,
        include: {
          services: { include: { service: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return serialize(data);
}

export async function getClient(id: string) {
  const data = await prisma.client.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        include: {
          services: { include: { service: true } },
        },
      },
    },
  });
  return serialize(data);
}

export async function createClient(data: {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}) {
  const client = await prisma.client.create({ data });
  revalidatePath("/clients");
  return serialize(client);
}

export async function updateClient(
  id: string,
  data: { name?: string; phone?: string; email?: string; notes?: string }
) {
  const client = await prisma.client.update({ where: { id }, data });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return serialize(client);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}
