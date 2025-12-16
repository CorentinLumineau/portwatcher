import { ChevronUp, ChevronDown } from 'lucide-preact';
import type { SortColumn, SortDirection } from '../../store/types';

interface TableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

interface ColumnConfig {
  key: SortColumn;
  label: string;
  width: string;
  mono?: boolean;
}

const columns: ColumnConfig[] = [
  { key: 'process', label: 'Process', width: 'w-[180px]' },
  { key: 'pid', label: 'PID', width: 'w-[80px]', mono: true },
  { key: 'port', label: 'Port', width: 'w-[80px]', mono: true },
  { key: 'protocol', label: 'Protocol', width: 'w-[90px]' },
  { key: 'address', label: 'Address', width: 'w-[200px]', mono: true },
  { key: 'user', label: 'User', width: 'w-[100px]' },
];

export function TableHeader({ sortColumn, sortDirection, onSort }: TableHeaderProps) {
  return (
    <div class="table-header flex items-center px-4 py-3">
      {columns.map((col) => {
        const isActive = sortColumn === col.key;
        return (
          <button
            key={col.key}
            onClick={() => onSort(col.key)}
            class={`${col.width} flex-shrink-0 flex items-center gap-1.5 group transition-colors duration-150 ${
              isActive
                ? 'text-neon-cyan'
                : 'text-cyber-muted hover:text-gray-300'
            }`}
          >
            <span class={`text-xxs font-semibold uppercase tracking-wider ${col.mono ? 'font-mono' : ''}`}>
              {col.label}
            </span>
            <span
              class={`flex-shrink-0 transition-all duration-150 ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
              }`}
            >
              {sortDirection === 'asc' || !isActive ? (
                <ChevronUp class="w-3.5 h-3.5" />
              ) : (
                <ChevronDown class="w-3.5 h-3.5" />
              )}
            </span>
          </button>
        );
      })}
      <div class="w-[60px] flex-shrink-0 text-right text-xxs font-semibold uppercase tracking-wider text-cyber-muted">
        Action
      </div>
    </div>
  );
}
