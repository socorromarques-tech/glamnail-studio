"use client";

import { useState } from "react";
import { createClient } from "@/actions/clients";
import { createAppointment, getAvailableSlots } from "@/actions/appointments";
import { formatCurrency } from "@/lib/utils";
import {
  Scissors, Calendar, Clock, User, Phone, Mail,
  ChevronRight, ChevronLeft, Check, Sparkles, MessageSquare,
} from "lucide-react";

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

export function BookingForm({ services, config }: { services: Service[]; config: Config }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = services.find((sv) => sv.id === id);
    return sum + (s ? Number(s.price) : 0);
  }, 0);

  const totalDuration = selectedServices.reduce((sum, id) => {
    const s = services.find((sv) => sv.id === id);
    return sum + (s ? s.duration : 0);
  }, 0);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setLoadingSlots(true);
    try {
      const available = await getAvailableSlots(date, selectedServices);
      setSlots(available);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create or find client
      const client = await createClient({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
      });

      // Create appointment
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
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-heading font-bold mb-2">Agendamento Confirmado!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          O seu tratamento foi agendado com sucesso. Receberá uma confirmação em breve.
        </p>
        <div className="card p-4 max-w-sm mx-auto mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Data</span>
              <span className="font-medium">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hora</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="font-bold gradient-text">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
        <a href="/" className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Voltar ao Início
        </a>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Serviços" },
    { num: 2, label: "Data & Hora" },
    { num: 3, label: "Dados" },
    { num: 4, label: "Confirmar" },
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s.num ? "gradient-bg text-white shadow-lg shadow-primary-500/25" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-1 ${step > s.num ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Services */}
      {step === 1 && (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-heading font-semibold mb-4">Escolha os serviços</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedServices.includes(s.id)
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                  </div>
                  {selectedServices.includes(s.id) && (
                    <Check className="w-5 h-5 text-primary-500" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="font-bold text-sm">{formatCurrency(Number(s.price))}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.duration} min
                  </span>
                </div>
              </button>
            ))}
          </div>
          {selectedServices.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 flex items-center justify-between">
              <span className="text-sm"><strong>{selectedServices.length}</strong> serviço(s) · {totalDuration} min</span>
              <span className="font-bold gradient-text">{formatCurrency(totalPrice)}</span>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button onClick={() => setStep(2)} disabled={selectedServices.length === 0} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-heading font-semibold mb-4">Escolha data e hora</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input"
            />
          </div>
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium mb-2">Horários disponíveis</label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Sem horários disponíveis para esta data</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? "gradient-bg text-white shadow-md"
                          : slot.available
                          ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={() => setStep(3)} disabled={!selectedTime} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Personal info */}
      {step === 3 && (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-heading font-semibold mb-4">Os seus dados</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input pl-10" placeholder="O seu nome" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input pl-10" placeholder="+351 900 000 000" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input pl-10" placeholder="email@exemplo.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input pl-10" rows={3} placeholder="Alguma nota adicional..." />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="btn-ghost flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <button onClick={() => setStep(4)} disabled={!form.name || !form.phone} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-heading font-semibold mb-4">Confirmar Agendamento</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Serviços</span>
                <span className="font-medium">
                  {selectedServices.map((id) => services.find((s) => s.id === id)?.name).join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Data</span>
                <span className="font-medium">{selectedDate}</span>
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
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold gradient-text">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(3)} className="btn-ghost flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Confirmar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
