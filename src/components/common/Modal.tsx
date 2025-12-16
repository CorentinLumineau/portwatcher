import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ComponentChildren;
  footer?: ComponentChildren;
}

export function Modal({ title, isOpen, onClose, children, footer }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        class="modal-overlay"
        onClick={onClose}
      />

      {/* Modal content */}
      <div class="modal-content mx-4 flex flex-col">
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-cyber-border">
          <h2 class="text-lg font-display font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            class="p-1.5 rounded-lg text-cyber-muted hover:text-gray-300 hover:bg-glass-light transition-all duration-150"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div class="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-cyber-border bg-cyber-dark/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
