import type { ElementType, ReactNode } from "react";

type EmptyStateProps = {
  icon: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
