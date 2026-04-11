import { AppointmentWithRelations, N8nWebhookPayload } from "@/types";

export async function triggerN8nWebhook(
  event: N8nWebhookPayload["event"],
  appointment: AppointmentWithRelations,
  businessName: string,
): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("n8n webhook URL not configured");
    return false;
  }

  try {
    const payload: N8nWebhookPayload = {
      event,
      appointment,
      businessName,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`n8n webhook failed: ${response.status}`);
      return false;
    }

    console.log(`n8n webhook triggered: ${event}`);
    return true;
  } catch (error) {
    console.error("n8n webhook error:", error);
    return false;
  }
}
