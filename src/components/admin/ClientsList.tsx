"use client";

import { useState } from "react";
import { createClient, updateClient, deleteClient } from "@/actions/clients";
import { formatDate } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, Phone, Mail, X, User, Users } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: Date;
  appointments: unknown[];
}

export function ClientsList({ clients: initialClients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const filteredClients = initialClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingClient(null);
    setForm({ name: "", phone: "", email: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      notes: client.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, form);
      } else {
        await createClient(form);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este cliente?")) {
      await deleteClient(id);
    }
  };

  return (
    <>
      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-xs text-gray-400">
                    {client.appointments.length} agendamento{client.appointments.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(client)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {client.email}
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400">
                Desde {formatDate(client.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold">
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "A guardar..." : editingClient ? "Guardar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
