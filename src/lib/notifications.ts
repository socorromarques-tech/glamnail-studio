import { sendWhatsAppMessage } from "@/lib/ai/chat";
import type { AppointmentWithRelations } from "@/types";

export type AppointmentEvent =
  | "appointment.created"
  | "appointment.confirmed"
  | "appointment.cancelled"
  | "appointment.reminder";

const BUSINESS_NAME = process.env.BUSINESS_NAME ?? "GlamNail Studio";

// ---------------------------------------------------------------------------
// Helper formatters
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatServices(apt: AppointmentWithRelations): string {
  return apt.services.map((s) => s.service.name).join(", ");
}

function formatTotalPrice(apt: AppointmentWithRelations): string {
  const total = apt.services.reduce(
    (sum, s) => sum + Number(s.service.price),
    0,
  );
  return `${total.toFixed(2)} €`;
}

// ---------------------------------------------------------------------------
// Message templates
// ---------------------------------------------------------------------------

const MESSAGE_TEMPLATES: Record<
  AppointmentEvent,
  (apt: AppointmentWithRelations, businessName: string) => string
> = {
  "appointment.created": (apt, businessName) =>
    `Olá ${apt.client.name}! 🌸\n\n` +
    `A sua marcação no ${businessName} foi criada com sucesso!\n\n` +
    `📅 Data: ${formatDate(apt.date)}\n` +
    `⏰ Hora: ${formatTime(apt.date)}\n` +
    `💅 Serviços: ${formatServices(apt)}\n` +
    `💳 Total: ${formatTotalPrice(apt)}\n\n` +
    `Aguardamos por si!`,

  "appointment.confirmed": (apt, businessName) =>
    `Olá ${apt.client.name}! ✅\n\n` +
    `A sua marcação no ${businessName} está confirmada!\n\n` +
    `📅 Data: ${formatDate(apt.date)}\n` +
    `⏰ Hora: ${formatTime(apt.date)}\n` +
    `💅 Serviços: ${formatServices(apt)}\n\n` +
    `Até já!`,

  "appointment.cancelled": (apt, businessName) =>
    `Olá ${apt.client.name}! 😔\n\n` +
    `Lamentamos informar que a sua marcação no ${businessName} foi cancelada.\n\n` +
    `📅 Data: ${formatDate(apt.date)}\n` +
    `⏰ Hora: ${formatTime(apt.date)}\n\n` +
    `Não hesite em remarcar quando preferir. Estamos aqui para si!`,

  "appointment.reminder": (apt, businessName) =>
    `Olá ${apt.client.name}! ⏰\n\n` +
    `Lembrete: A sua marcação no ${businessName} é amanhã!\n\n` +
    `📅 Data: ${formatDate(apt.date)}\n` +
    `⏰ Hora: ${formatTime(apt.date)}\n` +
    `💅 Serviços: ${formatServices(apt)}\n\n` +
    `Até amanhã!`,
};

// ---------------------------------------------------------------------------
// Phone normalisation
// ---------------------------------------------------------------------------

function normalisePhone(phone: string): string {
  const stripped = phone.replace(/\D/g, "");
  const withSuffix = `${stripped}@s.whatsapp.net`;
  return withSuffix;
}

// ---------------------------------------------------------------------------
// Core notification function
// ---------------------------------------------------------------------------

/**
 * Sends a WhatsApp notification for an appointment event.
 * Failures are logged but never thrown — the caller is never disrupted.
 */
export async function notifyAppointmentEvent(
  event: AppointmentEvent,
  appointment: AppointmentWithRelations,
  businessName: string = BUSINESS_NAME,
): Promise<void> {
  // Guard: early exit if Evolution API is not configured
  if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_TOKEN) {
    console.warn(
      `[notifyAppointmentEvent] Evolution API not configured — skipping ${event} for appointment ${appointment.id}`,
    );
    return;
  }

  const template = MESSAGE_TEMPLATES[event];
  const message = template(appointment, businessName);

  const rawPhone = appointment.client.phone;
  const phone = normalisePhone(rawPhone);
  const phoneLast4 = rawPhone.replace(/\D/g, "").slice(-4);

  const maxAttempts = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxAttempts && !success) {
    attempt++;
    success = await sendWhatsAppMessage(phone, message);

    const logLevel = success ? "INFO" : "WARN";
    console[logLevel === "INFO" ? "log" : "warn"](
      `[notifyAppointmentEvent] event=${event} appointmentId=${appointment.id} phone=***${phoneLast4} attempt=${attempt}/${maxAttempts} success=${success}`,
    );

    if (!success && attempt < maxAttempts) {
      // Exponential backoff: 1s → 2s → 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
