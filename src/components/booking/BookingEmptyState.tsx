import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface BookingEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: ReactNode;
}

export function BookingEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
}: BookingEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center dark:border-gray-700 dark:bg-gray-900/30">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-500 shadow-sm dark:bg-gray-800">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>
      <h3 className="mb-1 font-medium">{title}</h3>
      <p className="mx-auto mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <button type="button" onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn-ghost"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
