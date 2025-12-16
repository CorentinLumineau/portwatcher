import { Select } from './common';
import { X, Filter } from 'lucide-preact';
import type { FilterState } from '../store/types';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const hasActiveFilters =
    filters.protocol !== 'all' ||
    filters.state !== 'all' ||
    filters.user !== 'all' ||
    filters.portRange !== null;

  const activeCount = [
    filters.protocol !== 'all',
    filters.state !== 'all',
    filters.user !== 'all',
    filters.portRange !== null,
  ].filter(Boolean).length;

  return (
    <div class="flex flex-wrap items-center gap-2">
      {/* Filter indicator */}
      <div class="flex items-center gap-1.5 text-cyber-muted">
        <Filter class="w-3.5 h-3.5" />
        <span class="text-xxs font-mono uppercase tracking-wider">Filters</span>
        {activeCount > 0 && (
          <span class="flex items-center justify-center w-4 h-4 rounded-full bg-neon-cyan/20 text-neon-cyan text-xxs font-mono">
            {activeCount}
          </span>
        )}
      </div>

      <div class="divider-vertical" />

      <Select
        value={filters.protocol}
        onChange={(value) =>
          onChange({ ...filters, protocol: value as FilterState['protocol'] })
        }
        options={[
          { value: 'all', label: 'All Protocols' },
          { value: 'tcp', label: 'TCP Only' },
          { value: 'udp', label: 'UDP Only' },
        ]}
        size="sm"
        class="w-[130px]"
      />

      <Select
        value={filters.state}
        onChange={(value) =>
          onChange({ ...filters, state: value as FilterState['state'] })
        }
        options={[
          { value: 'all', label: 'All States' },
          { value: 'listen', label: 'Listening' },
        ]}
        size="sm"
        class="w-[120px]"
      />

      <Select
        value={filters.user}
        onChange={(value) =>
          onChange({ ...filters, user: value as FilterState['user'] })
        }
        options={[
          { value: 'all', label: 'All Users' },
          { value: 'current', label: 'Current User' },
        ]}
        size="sm"
        class="w-[130px]"
      />

      {hasActiveFilters && (
        <button
          onClick={onClear}
          class="flex items-center gap-1 px-2 py-1 rounded-md
                 text-cyber-muted hover:text-gray-300
                 hover:bg-glass-light
                 transition-all duration-150"
          title="Clear all filters"
        >
          <X class="w-3.5 h-3.5" />
          <span class="text-xxs font-medium">Clear</span>
        </button>
      )}
    </div>
  );
}
