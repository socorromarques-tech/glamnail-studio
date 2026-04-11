import { getBusinessConfig } from "@/actions/settings";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getBusinessConfig();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader businessName={config?.businessName} />
      <main className="flex-1">{children}</main>
      <PublicFooter businessName={config?.businessName} />
    </div>
  );
}
