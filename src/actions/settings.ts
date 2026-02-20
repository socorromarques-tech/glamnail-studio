"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBusinessConfig() {
  return prisma.businessConfig.findFirst();
}

export async function updateBusinessConfig(data: {
  businessName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  openTime?: string;
  closeTime?: string;
  slotInterval?: number;
  workDays?: string;
  n8nWebhookUrl?: string;
}) {
  const existing = await prisma.businessConfig.findFirst();

  if (existing) {
    const config = await prisma.businessConfig.update({
      where: { id: existing.id },
      data,
    });
    revalidatePath("/settings");
    return config;
  }

  const config = await prisma.businessConfig.create({
    data: {
      businessName: data.businessName || "GlamNail Studio",
      ownerName: data.ownerName || "",
      phone: data.phone || "",
      ...data,
    },
  });
  revalidatePath("/settings");
  return config;
}
