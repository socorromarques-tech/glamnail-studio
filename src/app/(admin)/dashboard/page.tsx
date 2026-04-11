import { getDashboardStats, getWeeklyChartData } from "@/actions/dashboard";
import {
  formatCurrency,
  formatTime,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, weeklyData] = await Promise.all([
    getDashboardStats(),
    getWeeklyChartData(),
  ]);

  const statCards = [
    {
      title: "Hoje",
      value: stats.todayAppointments,
      subtitle: "agendamentos",
      icon: Calendar,
    },
    {
      title: "Esta Semana",
      value: stats.weekAppointments,
      subtitle: "agendamentos",
      icon: TrendingUp,
    },
    {
      title: "Receita Mensal",
      value: formatCurrency(stats.monthRevenue),
      subtitle: "este mês",
      icon: DollarSign,
    },
    {
      title: "Clientes",
      value: stats.totalClients,
      subtitle: "registados",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Bem-vinda de volta! Aqui está o resumo do seu dia.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="stat-card-admin"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Chart & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly overview */}
        <div className="card-admin">
          <h2 className="font-heading font-semibold text-lg mb-4">
            Esta Semana
          </h2>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map((day) => {
              const maxVal = Math.max(
                ...weeklyData.map((d) => d.appointments),
                1,
              );
              const height = (day.appointments / maxVal) * 100;
              return (
                <div
                  key={day.name}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-gray-500">
                    {day.appointments}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gray-100 dark:bg-gray-800 relative overflow-hidden"
                    style={{ height: "120px" }}
                  >
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg gradient-bg transition-all duration-500"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{day.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="card-admin">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">
              Próximos Agendamentos
            </h2>
            <Link
              href="/appointments"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.upcomingAppointments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Sem agendamentos próximos
              </p>
            ) : (
              stats.upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {apt.client.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(apt.date)} —{" "}
                      {apt.services.map((s) => s.service.name).join(", ")}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
