import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@glamnail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@glamnail.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Create business config
  await prisma.businessConfig.deleteMany();
  await prisma.businessConfig.create({
    data: {
      businessName: "GlamNail Studio",
      ownerName: "Manicure",
      phone: "+351 912 345 678",
      email: "contato@glamnail.com",
      address: "Rua das Flores, 123 - Lisboa",
      openTime: "09:00",
      closeTime: "18:00",
      slotInterval: 30,
      workDays: "1,2,3,4,5,6",
    },
  });

  // Create services
  const services = [
    { name: "Manicure Simples", description: "Limpeza, corte e modelação das unhas", price: 15, duration: 30, color: "#E91E63" },
    { name: "Manicure com Verniz", description: "Manicure simples + aplicação de verniz", price: 20, duration: 45, color: "#9C27B0" },
    { name: "Manicure com Gel", description: "Aplicação de verniz gel com secagem UV", price: 30, duration: 60, color: "#FF4081" },
    { name: "Pedicure Simples", description: "Limpeza e cuidado dos pés", price: 20, duration: 45, color: "#4CAF50" },
    { name: "Pedicure com Verniz", description: "Pedicure completa + verniz", price: 25, duration: 60, color: "#00BCD4" },
    { name: "Aplicação de Unhas de Gel", description: "Alongamento completo com gel", price: 45, duration: 90, color: "#FF6F00" },
    { name: "Nail Art", description: "Decoração artística das unhas", price: 10, duration: 30, color: "#7C4DFF" },
    { name: "Remoção de Gel", description: "Remoção segura de verniz gel", price: 10, duration: 20, color: "#795548" },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // Create sample clients
  const clients = [
    { name: "Maria Silva", phone: "+351 911 111 111", email: "maria@email.com" },
    { name: "Ana Santos", phone: "+351 922 222 222", email: "ana@email.com" },
    { name: "Joana Costa", phone: "+351 933 333 333" },
    { name: "Sofia Ferreira", phone: "+351 944 444 444", email: "sofia@email.com" },
    { name: "Beatriz Oliveira", phone: "+351 955 555 555" },
  ];

  for (const client of clients) {
    await prisma.client.create({ data: client });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
