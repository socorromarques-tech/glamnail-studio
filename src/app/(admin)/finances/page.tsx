import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  );

  const [thisMonth, lastMonth, topServices] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        status: "COMPLETED",
      },
      select: { totalPrice: true },
    }),
    prisma.appointment.findMany({
      where: {
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: "COMPLETED",
      },
      select: { totalPrice: true },
    }),
    prisma.appointmentService.groupBy({
      by: ["serviceId"],
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    }),
  ]);

  const thisMonthRevenue = thisMonth.reduce(
    (sum, a) => sum + Number(a.totalPrice),
    0,
  );
  const lastMonthRevenue = lastMonth.reduce(
    (sum, a) => sum + Number(a.totalPrice),
    0,
  );
  const growth =
    lastMonthRevenue > 0
      ? (
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
          100
        ).toFixed(1)
      : "0";

  const serviceDetails = await prisma.service.findMany({
    where: { id: { in: topServices.map((s) => s.serviceId) } },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Finanças</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Resumo financeiro do gabinete
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Este Mês</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(thisMonthRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {thisMonth.length} serviços concluídos
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Mês Anterior</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(lastMonthRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lastMonth.length} serviços concluídos
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Crescimento</p>
              <p className="text-2xl font-bold mt-1">{growth}%</p>
              <p className="text-xs text-gray-400 mt-1">vs mês anterior</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <h2 className="font-heading font-semibold">
            Serviços Mais Populares
          </h2>
        </div>
        <div className="space-y-3">
          {topServices.map((ts, i) => {
            const service = serviceDetails.find((s) => s.id === ts.serviceId);
            if (!service) return null;
            const maxCount = topServices[0]._count.serviceId;
            const width = (ts._count.serviceId / maxCount) * 100;
            return (
              <div key={ts.serviceId} className="flex items-center gap-4">
                <span className="text-sm font-medium w-6 text-gray-400">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{service.name}</span>
                    <span className="text-sm text-gray-400">
                      {ts._count.serviceId}x
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-bg transition-all duration-500"
                      style={{ width: width + "%" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {topServices.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              Sem dados disponíveis
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
