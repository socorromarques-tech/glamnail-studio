"use client";

import { useState } from "react";
import {
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointments,
} from "@/actions/appointments";
import { formatTime, formatCurrency, getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import {
  Plus, Calendar, ChevronLeft, ChevronRight, Clock,
  User, X, Check, XCircle, Trash2,
} from "lucide-react";
import { AppointmentStatus } from "@prisma/client";

interface AppointmentWithRelations {
  id: string;
  date: Date;
  endTime: Date;
  status: string;
  totalPrice: number | string;
  notes: string | null;
  client: { id: string; name: string; phone: string };
  services: Array<{ service: { id: string; name: string; color: string } }>;
}

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  color: string;
}

export function AppointmentsList({
  appointments: initialAppointments,
  clients,
  services,
}: {
  appointments: AppointmentWithRelations[];
  clients: Client[];
  services: Service[];
}) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    serviceIds: [] as string[],
    date: selectedDate,
    time: "09:00",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const changeDate = async (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split("T")[0];
    setSelectedDate(newDate);
    const data = await getAppointments({ date: newDate });
    setAppointments(data);
  };

  const toggleService = (serviceId: string) => {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dateTime = new Date(`${form.date}T${form.time}:00`);
      await createAppointment({
        clientId: form.clientId,
        serviceIds: form.serviceIds,
        date: dateTime,
        notes: form.notes || undefined,
      });
      setShowModal(false);
      const data = await getAppointments({ date: selectedDate });
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(id, status);
    const data = await getAppointments({ date: selectedDate });
    setAppointments(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Eliminar este agendamento?")) {
      await deleteAppointment(id);
      const data = await getAppointments({ date: selectedDate });
      setAppointments(data);
    }
  };

  const selectedTotal = form.serviceIds.reduce((sum, id) => {
    const s = services.find((sv) => sv.id === id);
    return sum + (s ? Number(s.price) : 0);
  }, 0);

  const selectedDuration = form.serviceIds.reduce((sum, id) => {
    const s = services.find((sv) => sv.id === id);
    return sum + (s ? s.duration : 0);
  }, 0);

  return (
    <>
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => changeDate(-1)} className="btn-ghost p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={async (e) => {
                setSelectedDate(e.target.value);
                const data = await getAppointments({ date: e.target.value });
                setAppointments(data);
              }}
              className="input w-auto"
            />
          </div>
          <button onClick={() => changeDate(1)} className="btn-ghost p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => {
            setForm({ clientId: "", serviceIds: [], date: selectedDate, time: "09:00", notes: "" });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Sem agendamentos para {formatDate(selectedDate)}</p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatTime(apt.date)}</p>
                    <p className="text-xs text-gray-400">{formatTime(apt.endTime)}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{apt.client.name}</span>
                      <span className={`badge ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {apt.services.map((s) => (
                        <span
                          key={s.service.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${s.service.color}15`,
                            color: s.service.color,
                          }}
                        >
                          {s.service.name}
                        </span>
                      ))}
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-gray-400 mt-1">{apt.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatCurrency(Number(apt.totalPrice))}
                  </span>
                  <div className="flex gap-1 ml-2">
                    {apt.status === "PENDING" && (
                      <button
                        onClick={() => handleStatus(apt.id, "CONFIRMED")}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500"
                        title="Confirmar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                      <>
                        <button
                          onClick={() => handleStatus(apt.id, "COMPLETED")}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
                          title="Concluir"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatus(apt.id, "CANCELLED")}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold">Novo Agendamento</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Selecionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Serviços *</label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${
                        form.serviceIds.includes(s.id)
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatCurrency(Number(s.price))} · {s.duration} min
                      </p>
                    </button>
                  ))}
                </div>
                {form.serviceIds.length > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/10 text-sm">
                    Total: <strong>{formatCurrency(selectedTotal)}</strong> · {selectedDuration} min
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora *</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading || form.serviceIds.length === 0} className="btn-primary flex-1">
                  {loading ? "A criar..." : "Criar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
