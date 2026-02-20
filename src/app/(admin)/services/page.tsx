import { getServices } from "@/actions/services";
import { ServicesList } from "@/components/admin/ServicesList";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await getServices(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Serviços</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerir os serviços oferecidos no gabinete
        </p>
      </div>
      <ServicesList services={services} />
    </div>
  );
}
