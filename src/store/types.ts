// Port information returned from Rust backend
export interface PortInfo {
  pid: number;
  process_name: string;
  port: number;
  protocol: 'Tcp' | 'Udp';
  address: string;
  user: string;
}

// Result of kill process operation
export interface KillResult {
  status: 'Success' | 'PermissionDenied' | 'ElevationRequired' | 'ProcessNotFound' | 'Error';
  pid?: number;
  message?: string;
}

// Port range for scanning
export interface PortRange {
  start: number;
  end: number;
}

// Preset configuration for common port ranges
export interface PortPreset {
  id: string;
  name: string;
  description: string;
  ports: number[];
  ranges: PortRange[];
}

// Tray statistics
export interface TrayStats {
  total_ports: number;
  tcp_count: number;
  udp_count: number;
}

// Filter state
export interface FilterState {
  protocol: 'all' | 'tcp' | 'udp';
  state: 'all' | 'listen' | 'established';
  user: 'all' | 'current';
  portRange: PortRange | null;
}

// Sort configuration
export type SortColumn = 'port' | 'process' | 'pid' | 'protocol' | 'address' | 'user';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

// View mode
export type ViewMode = 'all' | 'listening';

// Display settings
export interface DisplaySettings {
  defaultView: ViewMode;
  defaultSort: SortColumn;
  defaultSortDirection: SortDirection;
  theme: 'dark' | 'light';
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  watchedPorts: number[];
}

// Application settings
export interface AppSettings {
  refreshInterval: number;
  startMinimized: boolean;
  startOnLogin: boolean;
  notifications: NotificationSettings;
  display: DisplaySettings;
}

// Default settings
export const defaultSettings: AppSettings = {
  refreshInterval: 5000,
  startMinimized: false,
  startOnLogin: false,
  notifications: {
    enabled: true,
    soundEnabled: false,
    watchedPorts: [],
  },
  display: {
    defaultView: 'all',
    defaultSort: 'port',
    defaultSortDirection: 'asc',
    theme: 'dark',
  },
};

// Default filter state
export const defaultFilters: FilterState = {
  protocol: 'all',
  state: 'all',
  user: 'all',
  portRange: null,
};

// Default sort config
export const defaultSortConfig: SortConfig = {
  column: 'port',
  direction: 'asc',
};
