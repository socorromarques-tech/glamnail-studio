"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServices(includeInactive = false) {
  return prisma.service.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: { name: "asc" },
  });
}

export async function getService(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function createService(data: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  color?: string;
}) {
  const service = await prisma.service.create({
    data: {
      ...data,
      price: data.price,
    },
  });
  revalidatePath("/services");
  return service;
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    color?: string;
    active?: boolean;
  }
) {
  const service = await prisma.service.update({ where: { id }, data });
  revalidatePath("/services");
  return service;
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });
  revalidatePath("/services");
}
