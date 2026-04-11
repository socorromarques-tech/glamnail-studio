import { Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

interface PublicHeaderProps {
  businessName?: string | null;
}

export function PublicHeader({ businessName }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg gradient-text">
            {businessName || "GlamNail Studio"}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/#servicos"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors hidden sm:block"
          >
            Serviços
          </Link>
          <Link
            href="/#contacto"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors hidden sm:block"
          >
            Contacto
          </Link>
          <Link href="/booking" className="btn-primary text-sm py-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Agendar
          </Link>
        </div>
      </div>
    </header>
  );
}
