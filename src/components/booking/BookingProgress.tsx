import { Check } from "lucide-react";

interface BookingProgressStep {
  num: number;
  label: string;
}

interface BookingProgressProps {
  currentStep: number;
  steps: BookingProgressStep[];
}

export function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;

        return (
          <li key={step.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
                  isCompleted
                    ? "border-primary-500 bg-primary-500 text-white"
                    : isCurrent
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.num}
              </div>
              <span
                className={`hidden text-xs sm:block ${
                  isCurrent
                    ? "font-medium text-primary-600 dark:text-primary-400"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 ${
                  isCompleted
                    ? "bg-primary-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
