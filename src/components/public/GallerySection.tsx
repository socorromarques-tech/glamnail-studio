import { PublicSectionHeader } from "./PublicSectionHeader";

const galleryItems = [
  { title: "Nude Elegante", tone: "from-rose-100 to-pink-100" },
  { title: "French Clássica", tone: "from-gray-100 to-white" },
  { title: "Brilho Dourado", tone: "from-amber-100 to-yellow-100" },
  { title: "Arte Floral", tone: "from-fuchsia-100 to-rose-100" },
  { title: "Minimal Clean", tone: "from-slate-100 to-zinc-100" },
  { title: "Noite Glam", tone: "from-purple-100 to-indigo-100" },
];

export function GallerySection() {
  return (
    <section className="bg-white px-4 py-20 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <PublicSectionHeader
          eyebrow="Inspiração"
          title="Estilos que"
          highlight="as clientes adoram"
          description="Referências reais para ajudar na sua escolha antes do agendamento."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, index) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800"
            >
              <div
                className={`h-52 bg-gradient-to-br ${item.tone} dark:from-gray-800 dark:to-gray-700 transition-transform duration-300 group-hover:scale-[1.02]`}
              />
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  #{index + 1} {item.title}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
