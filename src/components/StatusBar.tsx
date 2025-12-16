import { RefreshCw, Database, Eye } from 'lucide-preact';

interface StatusBarProps {
  totalCount: number;
  filteredCount: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export function StatusBar({
  totalCount,
  filteredCount,
  onRefresh,
  isLoading,
}: StatusBarProps) {
  const isFiltered = filteredCount !== totalCount;

  return (
    <footer class="relative z-10 flex-shrink-0 glass-panel border-0 border-t border-cyber-border/50">
      <div class="flex items-center justify-between px-5 py-2.5">
        {/* Stats */}
        <div class="flex items-center gap-4">
          {/* Total ports */}
          <div class="flex items-center gap-2">
            <Database class="w-3.5 h-3.5 text-cyber-muted" />
            <span class="text-xs text-cyber-muted">
              <span class="font-mono text-neon-cyan font-medium">{totalCount}</span>
              <span class="ml-1">ports</span>
            </span>
          </div>

          {/* Filtered indicator */}
          {isFiltered && (
            <>
              <div class="divider-vertical" />
              <div class="flex items-center gap-2">
                <Eye class="w-3.5 h-3.5 text-cyber-muted" />
                <span class="text-xs text-cyber-muted">
                  Showing{' '}
                  <span class="font-mono text-neon-magenta font-medium">{filteredCount}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg
                 text-cyber-muted hover:text-gray-300
                 hover:bg-glass-light
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-all duration-150 group"
          title="Refresh ports (Ctrl+R)"
        >
          <RefreshCw
            class={`w-3.5 h-3.5 transition-transform duration-300 ${
              isLoading ? 'animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span class="text-xxs font-mono uppercase tracking-wider">
            {isLoading ? 'Refreshing' : 'Refresh'}
          </span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 kbd">
            <span class="text-[10px]">Ctrl</span>
            <span class="text-[10px]">+</span>
            <span class="text-[10px]">R</span>
          </kbd>
        </button>
      </div>
    </footer>
  );
}
