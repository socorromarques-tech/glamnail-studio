import { BadgeCheck, Clock3, ShieldCheck, Sparkles } from "lucide-react";

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Profissionais certificadas",
    description: "Técnicas com experiência e formação contínua.",
  },
  {
    icon: ShieldCheck,
    title: "Higiene rigorosa",
    description: "Materiais esterilizados e protocolos seguros.",
  },
  {
    icon: Clock3,
    title: "Pontualidade",
    description: "Atendimento organizado para respeitar o seu tempo.",
  },
  {
    icon: Sparkles,
    title: "Resultado premium",
    description: "Acabamento duradouro e cuidado em cada detalhe.",
  },
];

export function TrustBar() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-100 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400">
              <item.icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
