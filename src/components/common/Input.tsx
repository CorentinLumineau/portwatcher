import type { JSX } from 'preact';

interface InputProps extends Omit<JSX.HTMLAttributes<HTMLInputElement>, 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  type?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  class: className,
  disabled,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div class="w-full">
      {label && (
        <label
          for={inputId}
          class="block text-xxs font-semibold uppercase tracking-wider text-cyber-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        class={`
          w-full px-3 py-2 rounded-lg
          bg-cyber-dark/60 backdrop-blur-sm
          border border-cyber-border/50
          text-gray-200 placeholder-cyber-muted
          font-mono text-sm
          transition-all duration-200
          hover:border-cyber-muted/50
          focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-cyber-border/50
          ${error ? 'border-neon-red/50 focus:border-neon-red focus:ring-neon-red/20' : ''}
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p class="mt-1.5 text-xs text-neon-red">{error}</p>
      )}
      {helperText && !error && (
        <p class="mt-1.5 text-xs text-cyber-muted">{helperText}</p>
      )}
    </div>
  );
}
