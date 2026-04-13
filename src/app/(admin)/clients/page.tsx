import { getClients } from "@/actions/clients";
import { ClientsList } from "@/components/admin/ClientsList";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  // Serialize for client component
  const serializedClients = JSON.parse(JSON.stringify(clients));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} registado
            {clients.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <ClientsList clients={serializedClients} />
    </div>
  );
}
