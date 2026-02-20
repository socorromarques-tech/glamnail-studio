"use client";

import { useState } from "react";
import { createService, updateService, deleteService } from "@/actions/services";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Trash2, Clock, X, Scissors } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string };
  duration: number;
  color: string;
  active: boolean;
}

const COLOR_OPTIONS = [
  "#E91E63", "#9C27B0", "#FF4081", "#4CAF50", "#00BCD4",
  "#FF6F00", "#7C4DFF", "#795548", "#607D8B", "#F44336",
];

export function ServicesList({ services: initialServices }: { services: Service[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", duration: "", color: "#E91E63",
  });
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingService(null);
    setForm({ name: "", description: "", price: "", duration: "", color: "#E91E63" });
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      color: service.color,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        color: form.color,
      };
      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await createService(data);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este serviço?")) {
      await deleteService(id);
    }
  };

  const handleToggle = async (service: Service) => {
    await updateService(service.id, { active: !service.active });
  };

  return (
    <>
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialServices.map((service) => (
          <div
            key={service.id}
            className={`card p-5 relative overflow-hidden ${
              !service.active ? "opacity-60" : ""
            }`}
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: service.color }}
            />
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${service.color}20`, color: service.color }}
                >
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  {!service.active && (
                    <span className="text-xs text-gray-400">Inativo</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(service)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {service.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {service.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-lg font-bold gradient-text">
                {formatCurrency(Number(service.price))}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {service.duration} min
              </span>
            </div>
            <div className="mt-3">
              <button
                onClick={() => handleToggle(service)}
                className={`text-xs px-3 py-1 rounded-full ${
                  service.active
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {service.active ? "Ativo" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço (€) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (min) *</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        form.color === color ? "border-gray-800 dark:border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "A guardar..." : editingService ? "Guardar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
