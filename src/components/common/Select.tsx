import type { JSX } from 'preact';
import { ChevronDown } from 'lucide-preact';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<JSX.HTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  value?: string;
  size?: 'sm' | 'md';
}

export function Select({
  label,
  options,
  onChange,
  value,
  id,
  size = 'md',
  class: className,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const handleChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    onChange?.(e.currentTarget.value);
  };

  const sizeClasses = {
    sm: 'py-1.5 pl-3 pr-8 text-xs',
    md: 'py-2 pl-3 pr-9 text-sm',
  };

  return (
    <div class="relative">
      {label && (
        <label
          for={selectId}
          class="block text-xxs font-semibold uppercase tracking-wider text-cyber-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <div class="relative">
        <select
          id={selectId}
          class={`
            appearance-none cursor-pointer rounded-lg
            bg-cyber-dark/60 backdrop-blur-sm
            border border-cyber-border/50
            text-gray-200 font-medium
            transition-all duration-200
            hover:border-cyber-muted/50 hover:bg-cyber-dark/80
            focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20
            ${sizeClasses[size]}
            ${className || ''}
          `}
          onChange={handleChange}
          value={value}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              class="bg-cyber-dark text-gray-200"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown class="w-4 h-4 text-cyber-muted" />
        </div>
      </div>
    </div>
  );
}
