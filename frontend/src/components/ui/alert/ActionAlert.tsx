import { useEffect } from "react";
import Button from "../button/Button";
import { Icon } from "../../icons/ideas-icon";

export interface ActionAlertConfig {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

interface ActionAlertProps {
  config: ActionAlertConfig | null;
  onClose: () => void;
  onConfirm: () => void;
}

const variantStyles = {
  success: {
    icon: "checkcircle" as const,
    iconClass: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  },
  error: {
    icon: "alertcircle" as const,
    iconClass: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  },
  warning: {
    icon: "alerttriangle" as const,
    iconClass: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
  },
  info: {
    icon: "info" as const,
    iconClass: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  },
};

export default function ActionAlert({ config, onClose, onConfirm }: ActionAlertProps) {
  useEffect(() => {
    if (!config) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [config, onClose]);

  if (!config) return null;

  const style = variantStyles[config.variant];
  const needsConfirmation = Boolean(config.onConfirm);

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center overflow-y-auto bg-gray-400/50 p-4 backdrop-blur-[32px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="action-alert-title"
        aria-describedby="action-alert-message"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Tutup dialog"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.iconClass}`}>
          <Icon name={style.icon} className="h-6 w-6" />
        </div>
        <h2 id="action-alert-title" className="text-lg font-semibold text-gray-900 dark:text-white">
          {config.title}
        </h2>
        <p id="action-alert-message" className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {config.message}
        </p>
        <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
          {needsConfirmation && (
            <Button variant="outline" size="sm" onClick={onClose} className="justify-center">
              {config.cancelLabel || "Batal"}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={needsConfirmation ? onConfirm : onClose}
            className="justify-center"
          >
            {config.confirmLabel || (needsConfirmation ? "Lanjutkan" : "Mengerti")}
          </Button>
        </div>
      </div>
    </div>
  );
}
