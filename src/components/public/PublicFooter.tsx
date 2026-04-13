import { Sparkles } from "lucide-react";
import Link from "next/link";

interface PublicFooterProps {
  businessName?: string | null;
}

export function PublicFooter({ businessName }: PublicFooterProps) {
  return (
    <footer className="py-8 px-4 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium gradient-text">
            {businessName || "GlamNail Studio"}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
        <Link
          href="/login"
          className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
        >
          Área Admin
        </Link>
      </div>
    </footer>
  );
}
