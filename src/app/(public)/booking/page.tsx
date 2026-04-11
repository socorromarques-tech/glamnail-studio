import { getServices } from "@/actions/services";
import { getBusinessConfig } from "@/actions/settings";
import { BookingForm } from "@/components/booking/BookingForm";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const [services, config] = await Promise.all([
    getServices(),
    getBusinessConfig(),
  ]);

  // Serialize Decimal objects for client component
  const serializedServices = services.map((s) => ({
    ...s,
    price: Number(s.price),
  }));

  const serializedConfig = config ? { ...config } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold gradient-text">
            Agendar Tratamento
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Escolha o serviço, data e horário que preferir
          </p>
        </div>
        <BookingForm services={serializedServices} config={serializedConfig} />
      </div>
    </div>
  );
}
