import { getAppointments } from "@/actions/appointments";
import { getClients } from "@/actions/clients";
import { getServices } from "@/actions/services";
import { AppointmentsList } from "@/components/admin/AppointmentsList";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [appointments, clients, services] = await Promise.all([
    getAppointments({ date: today }),
    getClients(),
    getServices(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Agendamentos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerir os agendamentos do gabinete
        </p>
      </div>
      <AppointmentsList
        appointments={appointments}
        clients={clients}
        services={services}
      />
    </div>
  );
}
