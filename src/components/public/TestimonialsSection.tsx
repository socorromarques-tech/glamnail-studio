import { Star } from "lucide-react";
import { PublicSectionHeader } from "./PublicSectionHeader";

const testimonials = [
  {
    name: "Inês F.",
    text: "Atendimento impecável. Marquei online em 2 minutos e fui atendida na hora marcada.",
  },
  {
    name: "Carolina M.",
    text: "Durabilidade excelente e acabamento perfeito. Já virei cliente fixa.",
  },
  {
    name: "Rita S.",
    text: "Ambiente super agradável e equipa muito cuidadosa. Recomendo sem hesitar.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <PublicSectionHeader
          eyebrow="Prova social"
          title="O que dizem"
          highlight="sobre nós"
          description="Avaliações reais de clientes que já passaram pelo estúdio."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="card p-6">
              <div className="mb-3 flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`${item.name}-${i}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">“{item.text}”</p>
              <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
