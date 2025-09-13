import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import "./toast.css";

export type ToastType = "success" | "error" | "info" | "warning" | "confirm";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms; ignored for confirm until action
  onClose?: () => void;
  // For confirm type
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextValue {
  push: (opts: ToastOptions) => string;
  success: (msg: string, title?: string, opts?: Partial<ToastOptions>) => void;
  error: (msg: string, title?: string, opts?: Partial<ToastOptions>) => void;
  info: (msg: string, title?: string, opts?: Partial<ToastOptions>) => void;
  warning: (msg: string, title?: string, opts?: Partial<ToastOptions>) => void;
  confirm: (opts: Omit<ToastOptions, "type">) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

type InternalToast = Required<Pick<ToastOptions, "id" | "type" | "message">> &
  ToastOptions & { createdAt: number };

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id || `t_${++idRef.current}`;
      const toast: InternalToast = {
        id,
        type: opts.type || "info",
        message: opts.message,
        title: opts.title,
        duration: opts.type === "confirm" ? undefined : opts.duration ?? 4000,
        confirmLabel: opts.confirmLabel || "Yes",
        cancelLabel: opts.cancelLabel || "No",
        onConfirm: opts.onConfirm,
        onCancel: opts.onCancel,
        onClose: opts.onClose,
        createdAt: Date.now(),
      };
      setToasts((t) => [...t, toast]);

      if (toast.duration) {
        setTimeout(() => {
          remove(id);
          toast.onClose?.();
        }, toast.duration);
      }
      return id;
    },
    [remove]
  );

  const api: ToastContextValue = {
    push,
    success: (msg, title, opts) =>
      push({ ...opts, type: "success", message: msg, title }),
    error: (msg, title, opts) =>
      push({ ...opts, type: "error", message: msg, title }),
    info: (msg, title, opts) =>
      push({ ...opts, type: "info", message: msg, title }),
    warning: (msg, title, opts) =>
      push({ ...opts, type: "warning", message: msg, title }),
    confirm: (opts) => push({ ...opts, type: "confirm" }),
  };

  const handleConfirm = async (toast: InternalToast, confirm: boolean) => {
    remove(toast.id);
    try {
      if (confirm) {
        await toast.onConfirm?.();
      } else {
        toast.onCancel?.();
      }
    } finally {
      toast.onClose?.();
    }
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-content">
              <div className="toast-text">
                {t.title && <div className="toast-title">{t.title}</div>}
                <div className="toast-message">{t.message}</div>
              </div>
              {t.type !== "confirm" && (
                <button
                  className="toast-close"
                  onClick={() => handleConfirm(t, false)}
                >
                  ×
                </button>
              )}
            </div>
            {t.type === "confirm" && (
              <div className="toast-actions">
                <button
                  className="toast-btn cancel"
                  onClick={() => handleConfirm(t, false)}
                >
                  {t.cancelLabel}
                </button>
                <button
                  className="toast-btn confirm"
                  onClick={() => handleConfirm(t, true)}
                >
                  {t.confirmLabel}
                </button>
              </div>
            )}
            {t.type !== "confirm" && <div className="toast-bar" />}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
