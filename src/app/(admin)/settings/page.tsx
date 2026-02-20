"use client";

import { useState, useEffect } from "react";
import { getBusinessConfig, updateBusinessConfig } from "@/actions/settings";
import { Save, Store, Clock, Webhook } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    businessName: "", ownerName: "", phone: "", email: "",
    address: "", openTime: "09:00", closeTime: "18:00",
    slotInterval: 30, workDays: "1,2,3,4,5,6", n8nWebhookUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getBusinessConfig().then((config) => {
      if (config) {
        setForm({
          businessName: config.businessName,
          ownerName: config.ownerName,
          phone: config.phone,
          email: config.email || "",
          address: config.address || "",
          openTime: config.openTime,
          closeTime: config.closeTime,
          slotInterval: config.slotInterval,
          workDays: config.workDays,
          n8nWebhookUrl: config.n8nWebhookUrl || "",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateBusinessConfig(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-heading font-bold">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerir as definições do gabinete</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-primary-500" />
            <h2 className="font-heading font-semibold">Informações do Gabinete</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Gabinete</label>
              <input type="text" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proprietária</label>
              <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Morada</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary-500" />
            <h2 className="font-heading font-semibold">Horário de Funcionamento</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Abertura</label>
              <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecho</label>
              <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Intervalo (min)</label>
              <input type="number" value={form.slotInterval} onChange={(e) => setForm({ ...form, slotInterval: parseInt(e.target.value) })} className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Webhook className="w-5 h-5 text-primary-500" />
            <h2 className="font-heading font-semibold">Integração n8n</h2>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL do Webhook n8n</label>
            <input type="url" value={form.n8nWebhookUrl} onChange={(e) => setForm({ ...form, n8nWebhookUrl: e.target.value })} className="input" placeholder="https://n8n.exemplo.com/webhook/..." />
            <p className="text-xs text-gray-400 mt-1">Configure aqui a URL do webhook para automações (notificações WhatsApp, lembretes, etc.)</p>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "A guardar..." : saved ? "Guardado ✓" : "Guardar Alterações"}
        </button>
      </form>
    </div>
  );
}
