"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/actions/clients";
import { createAppointment, getAvailableSlots } from "@/actions/appointments";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  RefreshCcw,
  Scissors,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { BookingEmptyState } from "./BookingEmptyState";
import { BookingProgress } from "./BookingProgress";
import { BookingSummary } from "./BookingSummary";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  color: string;
}

type Config = {
  openTime: string;
  closeTime: string;
  slotInterval: number;
  workDays: string;
} | null;

type Step = 1 | 2 | 3 | 4;

const steps = [
  { num: 1, label: "Serviços" },
  { num: 2, label: "Data & Hora" },
  { num: 3, label: "Dados" },
  { num: 4, label: "Confirmar" },
];

const formatDateLabel = (date: string) => {
  if (!date) return "—";

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return parsedDate.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  });
};

export function BookingForm({ services, config }: { services: Service[]; config: Config }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedServiceDetails = useMemo(
    () =>
      selectedServices
        .map((id) => services.find((service) => service.id === id))
        .filter((service): service is Service => Boolean(service)),
    [selectedServices, services]
  );

  const totalPrice = selectedServiceDetails.reduce((sum, service) => sum + Number(service.price), 0);
  const totalDuration = selectedServiceDetails.reduce((sum, service) => sum + service.duration, 0);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((serviceId) => serviceId !== id) : [...prev, id]
    );
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setSlots([]);
    setSlotError(null);

    if (!date) {
      return;
    }

    setLoadingSlots(true);
    try {
      const available = await getAvailableSlots(date, selectedServices);
      setSlots(available);
    } catch (error) {
      console.error(error);
      setSlotError("Não conseguimos carregar os horários agora. Tente novamente em instantes.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const client = await createClient({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
      });

      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      await createAppointment({
        clientId: client.id,
        serviceIds: selectedServices,
        date: dateTime,
        notes: form.notes || undefined,
      });

      setSuccess(true);
    } catch (error) {
      console.error(error);
      setSubmitError("Não foi possível concluir o seu agendamento. Verifique os dados e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card animate-fade-in border-2 border-emerald-500/40 bg-emerald-50/30 p-8 text-center dark:bg-emerald-950/20">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mb-2 font-heading text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          Agendamento confirmado!
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Perfeito, {form.name || "cliente"}! Recebemos o seu pedido e vamos entrar em contacto em breve para finalizar os detalhes.
        </p>

        <div className="mx-auto mb-6 max-w-md rounded-xl border border-emerald-500/30 bg-white/80 p-4 dark:bg-gray-900/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Data</span>
              <span className="font-medium">{formatDateLabel(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hora</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingProgress currentStep={step} steps={steps} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {step === 1 && (
            <div className="card animate-fade-in p-6">
              <h2 className="mb-4 text-lg font-heading font-semibold">Escolha os serviços</h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service.id);

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      aria-pressed={isSelected}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/25 shadow-md shadow-primary-500/10 dark:bg-primary-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${service.color}15`, color: service.color }}
                          >
                            <Scissors className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="mt-0.5 text-xs text-gray-400">{service.description}</p>
                            )}
                          </div>
                        </div>

                        <div
                          className={`flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[11px] font-medium ${
                            isSelected
                              ? "border-primary-500 bg-primary-500 text-white"
                              : "border-gray-200 text-transparent dark:border-gray-700"
                          }`}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5" /> : ""}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                        <span className="text-sm font-bold">{formatCurrency(Number(service.price))}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" /> {service.duration} min
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-50/60 p-3 dark:bg-primary-900/10">
                  <span className="text-sm">
                    <strong>{selectedServices.length}</strong> serviço(s) · {totalDuration} min
                  </span>
                  <span className="font-bold gradient-text">{formatCurrency(totalPrice)}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectedServices.length === 0}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card animate-fade-in p-6">
              <h2 className="mb-4 text-lg font-heading font-semibold">Escolha data e hora</h2>

              <div className="mb-5">
                <label htmlFor="booking-date" className="mb-1 block text-sm font-medium">
                  Data
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className="input"
                />
                {config && (
                  <p className="mt-2 text-xs text-gray-400">
                    Horário de atendimento: {config.openTime} às {config.closeTime}.
                  </p>
                )}
              </div>

              {selectedDate && (
                <div>
                  <p className="mb-2 block text-sm font-medium">Horários disponíveis</p>

                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                      {Array.from({ length: 10 }, (_, value) => `slot-skeleton-${value + 1}`).map((id) => (
                        <div
                          key={id}
                          className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
                        />
                      ))}
                    </div>
                  ) : slotError ? (
                    <BookingEmptyState
                      title="Não foi possível carregar os horários"
                      description={slotError}
                      actionLabel="Tentar novamente"
                      onAction={() => handleDateChange(selectedDate)}
                      icon={<AlertTriangle className="h-5 w-5" />}
                    />
                  ) : slots.length === 0 ? (
                    <BookingEmptyState
                      title="Sem horários para esta data"
                      description="Pode escolher outra data ou tentar novamente daqui a pouco."
                      actionLabel="Escolher outra data"
                      onAction={() => {
                        setSelectedDate("");
                        setSelectedTime("");
                        setSlots([]);
                      }}
                      secondaryActionLabel="Atualizar horários"
                      onSecondaryAction={() => handleDateChange(selectedDate)}
                      icon={<CalendarDays className="h-5 w-5" />}
                    />
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-lg py-2 text-sm font-medium transition-all ${
                            selectedTime === slot.time
                              ? "gradient-bg text-white ring-2 ring-primary-500/30"
                              : slot.available
                              ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                              : "cursor-not-allowed bg-gray-50 text-gray-300 line-through dark:bg-gray-900 dark:text-gray-600"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedTime && (
                    <p className="mt-3 text-xs text-primary-600 dark:text-primary-400">
                      Horário selecionado: {selectedTime}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!selectedTime}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card animate-fade-in p-6">
              <h2 className="mb-4 text-lg font-heading font-semibold">Os seus dados</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="booking-name" className="mb-1 block text-sm font-medium">
                    Nome *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="booking-name"
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="input pl-10"
                      placeholder="O seu nome"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-phone" className="mb-1 block text-sm font-medium">
                    Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="booking-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className="input pl-10"
                      placeholder="+351 900 000 000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-email" className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="booking-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="input pl-10"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-notes" className="mb-1 block text-sm font-medium">
                    Observações
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      id="booking-notes"
                      value={form.notes}
                      onChange={(event) => setForm({ ...form, notes: event.target.value })}
                      className="input pl-10"
                      rows={3}
                      placeholder="Alguma nota adicional..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!form.name || !form.phone}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="card animate-fade-in p-6">
              <h2 className="mb-4 text-lg font-heading font-semibold">Confirmar agendamento</h2>

              {submitError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Não foi possível concluir</p>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Serviços</span>
                    <span className="text-right font-medium">
                      {selectedServiceDetails.map((service) => service.name).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Data</span>
                    <span className="font-medium">{formatDateLabel(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hora</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duração</span>
                    <span className="font-medium">{totalDuration} minutos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cliente</span>
                    <span className="font-medium">{form.name}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold gradient-text">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCcw className="h-4 w-4 animate-spin" /> A confirmar...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <BookingSummary
          services={services}
          selectedServiceIds={selectedServices}
          selectedDate={formatDateLabel(selectedDate)}
          selectedTime={selectedTime}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          customerName={form.name}
          className="lg:sticky lg:top-24"
        />
      </div>
    </div>
  );
}
