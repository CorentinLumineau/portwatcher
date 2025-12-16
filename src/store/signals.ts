import { signal, computed } from '@preact/signals';
import type {
  PortInfo,
  PortPreset,
  AppSettings,
  FilterState,
  SortConfig,
  SortColumn,
} from './types';
import { defaultSettings, defaultFilters, defaultSortConfig } from './types';

// Core state signals
export const ports = signal<PortInfo[]>([]);
export const searchQuery = signal('');
export const filters = signal<FilterState>(defaultFilters);
export const sortConfig = signal<SortConfig>(defaultSortConfig);
export const settings = signal<AppSettings>(defaultSettings);
export const isLoading = signal(false);
export const presets = signal<PortPreset[]>([]);
export const lastRefresh = signal<Date | null>(null);

// Comparison function for sorting
function compareBy(column: SortColumn, a: PortInfo, b: PortInfo): number {
  switch (column) {
    case 'port':
      return a.port - b.port;
    case 'process':
      return a.process_name.localeCompare(b.process_name);
    case 'pid':
      return a.pid - b.pid;
    case 'protocol':
      return a.protocol.localeCompare(b.protocol);
    case 'address':
      return a.address.localeCompare(b.address);
    case 'user':
      return a.user.localeCompare(b.user);
    default:
      return 0;
  }
}

// Derived state - filtered and sorted ports
export const filteredPorts = computed(() => {
  let result = ports.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.process_name.toLowerCase().includes(query) ||
        p.port.toString().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.user.toLowerCase().includes(query) ||
        p.pid.toString().includes(query)
    );
  }

  // Apply protocol filter
  const f = filters.value;
  if (f.protocol !== 'all') {
    const protocol = f.protocol === 'tcp' ? 'Tcp' : 'Udp';
    result = result.filter((p) => p.protocol === protocol);
  }

  // Apply user filter (current user)
  if (f.user === 'current') {
    // Get current user from first port or use a signal
    // For now, filter by common user process pattern
    const currentUser = result.length > 0 ? getCurrentUser() : null;
    if (currentUser) {
      result = result.filter((p) => p.user === currentUser);
    }
  }

  // Apply port range filter
  if (f.portRange) {
    const { start, end } = f.portRange;
    result = result.filter((p) => p.port >= start && p.port <= end);
  }

  // Apply sorting
  const { column, direction } = sortConfig.value;
  result = [...result].sort((a, b) => {
    const cmp = compareBy(column, a, b);
    return direction === 'asc' ? cmp : -cmp;
  });

  return result;
});

// Port counts
export const portCount = computed(() => ports.value.length);
export const filteredCount = computed(() => filteredPorts.value.length);

// Helper to get current user (from environment or first port)
function getCurrentUser(): string | null {
  // Try to get from environment or use a common pattern
  // In a real app, this would come from Tauri
  if (typeof window !== 'undefined') {
    // Use the most common user in current ports as a heuristic
    const userCounts = new Map<string, number>();
    ports.value.forEach((p) => {
      userCounts.set(p.user, (userCounts.get(p.user) || 0) + 1);
    });

    let maxUser: string | null = null;
    let maxCount = 0;
    userCounts.forEach((count, user) => {
      // Skip root as it's typically not the "current" user
      if (user !== 'root' && count > maxCount) {
        maxCount = count;
        maxUser = user;
      }
    });

    return maxUser;
  }
  return null;
}

// Reset all filters
export function resetFilters() {
  searchQuery.value = '';
  filters.value = defaultFilters;
}

// Reset sort to default
export function resetSort() {
  sortConfig.value = defaultSortConfig;
}
