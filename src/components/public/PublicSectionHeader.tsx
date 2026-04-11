interface PublicSectionHeaderProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  centered?: boolean;
}

export function PublicSectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  centered = true,
}: PublicSectionHeaderProps) {
  return (
    <div className={centered ? "mx-auto mb-12 max-w-2xl text-center" : "mb-12 max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-heading font-bold md:text-4xl text-gray-900 dark:text-white">
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </h2>
      {description && (
        <p className="mt-4 text-sm text-gray-500 md:text-base dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}
