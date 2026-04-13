import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Scissors,
  Star,
} from "lucide-react";
import Link from "next/link";

import { getServices } from "@/actions/services";
import { getBusinessConfig } from "@/actions/settings";
import { GallerySection } from "@/components/public/GallerySection";
import { PublicSectionHeader } from "@/components/public/PublicSectionHeader";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { TrustBar } from "@/components/public/TrustBar";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [services, config] = await Promise.all([
    getServices(),
    getBusinessConfig(),
  ]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden px-4 py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-gold-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100/50 px-4 py-1.5 text-sm font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <Star className="h-4 w-4" />
            Beleza premium em cada detalhe
          </div>

          <h1 className="mb-6 text-4xl font-heading font-bold text-primary-500 md:text-6xl lg:text-7xl">
            Unhas impecáveis,
            <br />
            presença <span className="gradient-text">inesquecível</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Marcação rápida, atendimento pontual e acabamento profissional para
            você sair pronta para brilhar.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
            >
              Marcar Sessão <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#servicos" className="btn-secondary px-8 py-3 text-lg">
              Explorar Serviços
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-6">
            {[
              { value: "500+", label: "Clientes Felizes" },
              { value: "8+", label: "Serviços" },
              { value: "5★", label: "Avaliação" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBar />

      <section id="servicos" className="bg-white px-4 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <PublicSectionHeader
            title="Os Nossos"
            highlight="Serviços"
            description="Desde manicure simples até nail art elaborada, temos o tratamento perfeito para si."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="card group p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${service.color}15`,
                    color: service.color,
                  }}
                >
                  <Scissors className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{service.name}</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {service.description}
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                  <span className="text-xl font-bold gradient-text">
                    {formatCurrency(Number(service.price))}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/booking"
              className="btn-primary inline-flex items-center gap-2"
            >
              Agendar um Serviço <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <GallerySection />
      <TestimonialsSection />

      <section id="contacto" className="bg-white px-4 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <div className="card gradient-bg relative overflow-hidden p-8 text-white md:p-12">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h2 className="mb-6 text-center text-3xl font-heading font-bold">
                Visite-nos
              </h2>
              <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                <div>
                  <MapPin className="mx-auto mb-2 h-6 w-6 opacity-80" />
                  <p className="text-sm opacity-90">
                    {config?.address || "Rua das Flores, 123 - Lisboa"}
                  </p>
                </div>
                <div>
                  <Phone className="mx-auto mb-2 h-6 w-6 opacity-80" />
                  <p className="text-sm opacity-90">
                    {config?.phone || "+351 912 345 678"}
                  </p>
                </div>
                <div>
                  <Clock className="mx-auto mb-2 h-6 w-6 opacity-80" />
                  <p className="text-sm opacity-90">
                    {config?.openTime || "09:00"} -{" "}
                    {config?.closeTime || "18:00"}
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-primary-600 shadow-lg transition-colors hover:bg-white/90"
                >
                  <Calendar className="h-5 w-5" />
                  Agendar Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
