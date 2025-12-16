import { useEffect, useRef } from 'preact/hooks';
import { Search, X } from 'lucide-preact';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div class="relative group">
      {/* Glow effect on focus */}
      <div class="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />

      <div class="relative flex items-center">
        {/* Search icon */}
        <div class="absolute left-4 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-cyber-muted group-focus-within:text-neon-cyan transition-colors duration-200" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onInput={(e) => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          class="w-full pl-11 pr-24 py-3 rounded-xl
                 bg-cyber-dark/60 backdrop-blur-sm
                 border border-cyber-border/50
                 text-gray-100 placeholder-cyber-muted
                 font-mono text-sm tracking-tight
                 transition-all duration-200
                 focus:outline-none focus:border-neon-cyan/40 focus:bg-cyber-dark/80
                 hover:border-cyber-muted/50"
        />

        {/* Right side actions */}
        <div class="absolute right-3 flex items-center gap-2">
          {/* Clear button */}
          {value && (
            <button
              onClick={() => onChange('')}
              class="p-1 rounded-md text-cyber-muted hover:text-gray-300 hover:bg-glass-light transition-all duration-150"
            >
              <X class="h-4 w-4" />
            </button>
          )}

          {/* Keyboard shortcut badge */}
          {!value && (
            <div class="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-cyber-surface/80 border border-cyber-border/50">
              <span class="text-xxs font-mono text-cyber-muted">Ctrl</span>
              <span class="text-xxs font-mono text-cyber-muted">+</span>
              <span class="text-xxs font-mono text-cyber-muted">K</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
