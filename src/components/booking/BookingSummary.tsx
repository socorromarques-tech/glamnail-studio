import { CalendarDays, Clock, Sparkles, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ServiceSummary {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BookingSummaryProps {
  services: ServiceSummary[];
  selectedServiceIds: string[];
  selectedDate: string;
  selectedTime: string;
  totalDuration: number;
  totalPrice: number;
  customerName?: string;
  className?: string;
}

export function BookingSummary({
  services,
  selectedServiceIds,
  selectedDate,
  selectedTime,
  totalDuration,
  totalPrice,
  customerName,
  className,
}: BookingSummaryProps) {
  const selectedServices = selectedServiceIds
    .map((id) => services.find((service) => service.id === id))
    .filter((service): service is ServiceSummary => Boolean(service));

  return (
    <aside className={`card p-5 ${className ?? ""}`}>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-500" />
        <h3 className="font-heading text-base font-semibold">Resumo do agendamento</h3>
      </div>

      {selectedServices.length === 0 ? (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
          Selecione os serviços para ver o resumo do seu agendamento.
        </p>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {selectedServices.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800/40"
              >
                <span className="font-medium">{service.name}</span>
                <span className="text-gray-500">{formatCurrency(Number(service.price))}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700">
            <p className="flex items-center justify-between gap-2 text-gray-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Data
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{selectedDate || "—"}</span>
            </p>
            <p className="flex items-center justify-between gap-2 text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Hora
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{selectedTime || "—"}</span>
            </p>
            <p className="flex items-center justify-between gap-2 text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Duração
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{totalDuration || 0} min</span>
            </p>
            <p className="flex items-center justify-between gap-2 text-gray-500">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Cliente
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{customerName || "—"}</span>
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold gradient-text">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
