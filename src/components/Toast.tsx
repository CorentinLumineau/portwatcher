import { signal } from '@preact/signals';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-preact';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Global toast state
export const toasts = signal<ToastMessage[]>([]);

// Helper to show toasts
export function showToast(type: ToastMessage['type'], message: string) {
  const id = `toast-${Date.now()}`;
  toasts.value = [...toasts.value, { id, type, message }];

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismissToast(id);
  }, 5000);
}

export function dismissToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    container: 'toast-success',
    icon: 'toast-icon-success',
    glow: 'from-neon-green/20',
  },
  error: {
    container: 'toast-error',
    icon: 'toast-icon-error',
    glow: 'from-neon-red/20',
  },
  info: {
    container: 'toast-info',
    icon: 'toast-icon-info',
    glow: 'from-neon-cyan/20',
  },
};

export function ToastContainer() {
  if (toasts.value.length === 0) return null;

  return (
    <div class="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.value.map((toast) => {
        const Icon = icons[toast.type];
        const style = styles[toast.type];
        return (
          <div
            key={toast.id}
            class={`toast ${style.container} group relative overflow-hidden`}
          >
            {/* Glow effect */}
            <div
              class={`absolute inset-0 bg-gradient-to-r ${style.glow} to-transparent opacity-50`}
            />

            {/* Content */}
            <div class="relative flex items-center gap-3">
              <div class={`toast-icon ${style.icon}`}>
                <Icon class="w-5 h-5" />
              </div>
              <span class="text-sm font-medium text-gray-200 pr-6">
                {toast.message}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={() => dismissToast(toast.id)}
              class="absolute top-1/2 right-3 -translate-y-1/2 p-1 rounded-md
                     text-cyber-muted hover:text-gray-300 hover:bg-glass-light
                     opacity-0 group-hover:opacity-100 transition-all duration-150"
            >
              <X class="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-border/30">
              <div
                class={`h-full ${
                  toast.type === 'success'
                    ? 'bg-neon-green'
                    : toast.type === 'error'
                    ? 'bg-neon-red'
                    : 'bg-neon-cyan'
                }`}
                style={{
                  animation: 'shrink 5s linear forwards',
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Inline keyframes for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
