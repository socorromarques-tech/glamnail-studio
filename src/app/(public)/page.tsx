import Link from "next/link";
import { getServices } from "@/actions/services";
import { getBusinessConfig } from "@/actions/settings";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles, Calendar, Clock, MapPin, Phone, Mail,
  ArrowRight, Star, Scissors, Heart,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [services, config] = await Promise.all([
    getServices(),
    getBusinessConfig(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg gradient-text">
              {config?.businessName || "GlamNail Studio"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#servicos" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors hidden sm:block">
              Serviços
            </Link>
            <Link href="#contacto" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors hidden sm:block">
              Contacto
            </Link>
            <Link href="/booking" className="btn-primary text-sm py-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Agendar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-gold-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Cuidado premium para as suas unhas
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
            As suas unhas<br />
            merecem o <span className="gradient-text">melhor</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Manicure, pedicure e nail art com técnicas profissionais.
            Agende o seu tratamento e sinta a diferença.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Agendar Agora <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#servicos" className="btn-secondary text-lg px-8 py-3">
              Ver Serviços
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
            {[
              { value: "500+", label: "Clientes Felizes" },
              { value: "8+", label: "Serviços" },
              { value: "5★", label: "Avaliação" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Os Nossos <span className="gradient-text">Serviços</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Desde manicure simples até nail art elaborada, temos o tratamento perfeito para si.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="card p-6 group hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${service.color}15`, color: service.color }}
                >
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xl font-bold gradient-text">
                    {formatCurrency(Number(service.price))}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/booking" className="btn-primary inline-flex items-center gap-2">
              Agendar um Serviço <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Porquê <span className="gradient-text">Escolher-nos</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Produtos Premium",
                desc: "Utilizamos apenas produtos de alta qualidade para garantir os melhores resultados.",
              },
              {
                icon: Star,
                title: "Profissionalismo",
                desc: "Equipa qualificada com anos de experiência em cuidados de unhas.",
              },
              {
                icon: Calendar,
                title: "Agendamento Fácil",
                desc: "Reserve online a qualquer momento, sem complicações.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 md:p-12 gradient-bg text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl font-heading font-bold mb-6 text-center">
                Visite-nos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <MapPin className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90">
                    {config?.address || "Rua das Flores, 123 - Lisboa"}
                  </p>
                </div>
                <div>
                  <Phone className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90">
                    {config?.phone || "+351 912 345 678"}
                  </p>
                </div>
                <div>
                  <Clock className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90">
                    {config?.openTime || "09:00"} - {config?.closeTime || "18:00"}
                  </p>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link href="/booking" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg">
                  <Calendar className="w-5 h-5" />
                  Agendar Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium gradient-text">
              {config?.businessName || "GlamNail Studio"}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
          <Link href="/login" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
            Área Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
