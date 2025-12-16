# PortWatcher v2.0 Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PortWatcher v2.0                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    System Tray                                │   │
│  │  ┌─────────┐  ┌──────────────┐  ┌──────────────────────┐    │   │
│  │  │  Icon   │  │   Tooltip    │  │    Context Menu      │    │   │
│  │  │ (badge) │  │ "X listening"│  │ Presets | Settings   │    │   │
│  │  └─────────┘  └──────────────┘  └──────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Preact Frontend                             │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐               │   │
│  │  │ SearchBar  │ │FilterPanel │ │RangeScanner│               │   │
│  │  └────────────┘ └────────────┘ └────────────┘               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              PortTable (Virtual Scroll)               │   │   │
│  │  │  ┌────────────────────────────────────────────────┐  │   │   │
│  │  │  │ Process │ Port │ Protocol │ Address │ Action   │  │   │   │
│  │  │  ├────────────────────────────────────────────────┤  │   │   │
│  │  │  │ node    │ 3000 │ TCP      │ 0.0.0.0 │ [Kill]   │  │   │   │
│  │  │  │ python  │ 8080 │ TCP      │ 127.0.0.1│ [Kill]  │  │   │   │
│  │  │  └────────────────────────────────────────────────┘  │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────┐                                          │   │
│  │  │ SettingsModal  │                                          │   │
│  │  └────────────────┘                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│           ┌──────────────────┼──────────────────┐                   │
│           │ Tauri IPC        │ Events           │                   │
│           ▼                  ▼                  ▼                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Rust Backend                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │   │
│  │  │ port_scanner │ │process_mgr   │ │ settings     │         │   │
│  │  │ + range scan │ │ + kill/elev  │ │ + store      │         │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │   │
│  │  │notifications │ │  presets     │ │process_res   │         │   │
│  │  │ + monitoring │ │ + builtin    │ │ + inode map  │         │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Linux Kernel                               │   │
│  │      /proc/net/tcp  │  /proc/net/udp  │  /proc/[pid]/fd/     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend Framework | Preact 10.x | Lightweight React alternative (3kb) |
| Build Tool | Vite 5.x | Fast HMR, ESM-first bundling |
| Styling | TailwindCSS 3.x | Utility-first CSS |
| State Management | Preact Signals | Fine-grained reactivity |
| Virtual Scrolling | @tanstack/virtual | High-performance list rendering |
| Icons | Lucide React | Tree-shakeable icon library |
| Settings Storage | tauri-plugin-store | Persistent key-value storage |
| Backend | Rust + Tauri v2 | Native performance, IPC |

## Frontend Architecture

### Directory Structure

```
src/
├── index.html              # HTML entry
├── main.tsx                # App bootstrap
├── app.tsx                 # Root component
├── vite-env.d.ts          # Vite types
│
├── components/
│   ├── PortTable/
│   │   ├── PortTable.tsx   # Virtual scrolled table container
│   │   ├── PortRow.tsx     # Single port row
│   │   ├── TableHeader.tsx # Sortable headers
│   │   └── index.ts        # Barrel export
│   │
│   ├── SearchBar.tsx       # Real-time search input
│   ├── FilterPanel.tsx     # Protocol/state/user filters
│   ├── RangeScanner.tsx    # Port range input with presets
│   ├── SettingsModal.tsx   # Configuration dialog
│   ├── StatusBar.tsx       # Port count, last refresh time
│   │
│   └── common/
│       ├── Button.tsx      # Styled button variants
│       ├── Input.tsx       # Form input
│       ├── Select.tsx      # Dropdown select
│       ├── Modal.tsx       # Dialog wrapper
│       └── Tooltip.tsx     # Hover tooltip
│
├── hooks/
│   ├── usePorts.ts         # Port fetching + filtering logic
│   ├── useSettings.ts      # Tauri store integration
│   ├── useFilters.ts       # Filter state management
│   ├── useSorting.ts       # Column sorting
│   └── useTauriEvents.ts   # Event subscription
│
├── store/
│   ├── signals.ts          # Global Preact signals
│   └── types.ts            # TypeScript interfaces
│
├── lib/
│   ├── tauri.ts            # invoke() wrappers with types
│   ├── filters.ts          # Filter/search algorithms
│   └── utils.ts            # Helper functions
│
└── styles/
    └── index.css           # Tailwind directives + custom
```

### Component Specifications

#### PortTable (Main Data Grid)

```typescript
// components/PortTable/PortTable.tsx
interface PortTableProps {
  ports: PortInfo[];
  onKill: (pid: number, elevated: boolean) => void;
  sortColumn: SortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
}

// Uses @tanstack/virtual for virtualization
// Renders ~20 visible rows, recycles DOM nodes
// Supports 10,000+ ports without lag
```

#### SearchBar

```typescript
// components/SearchBar.tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Features:
// - Debounced input (150ms)
// - Clear button
// - Search icon
// - Keyboard shortcut (Cmd/Ctrl+K)
```

#### FilterPanel

```typescript
// components/FilterPanel.tsx
interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

interface FilterState {
  protocol: 'all' | 'tcp' | 'udp';
  state: 'all' | 'listen' | 'established';
  user: 'all' | 'current';
  portRange: { start?: number; end?: number } | null;
}
```

#### RangeScanner

```typescript
// components/RangeScanner.tsx
interface RangeScannerProps {
  onScan: (start: number, end: number) => void;
  presets: PortPreset[];
  isScanning: boolean;
}

// Features:
// - Range input (start - end)
// - Preset dropdown (Web, Dev, Database)
// - Scan button with loading state
// - Validation (start < end, valid port range)
```

### State Management (Preact Signals)

```typescript
// store/signals.ts
import { signal, computed } from '@preact/signals';

// Core state
export const ports = signal<PortInfo[]>([]);
export const searchQuery = signal('');
export const filters = signal<FilterState>(defaultFilters);
export const sortConfig = signal<SortConfig>({ column: 'port', direction: 'asc' });
export const settings = signal<AppSettings>(defaultSettings);
export const isLoading = signal(false);

// Derived state (computed)
export const filteredPorts = computed(() => {
  let result = ports.value;

  // Apply search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.process_name.toLowerCase().includes(q) ||
      p.port.toString().includes(q) ||
      p.address.includes(q)
    );
  }

  // Apply filters
  const f = filters.value;
  if (f.protocol !== 'all') {
    result = result.filter(p => p.protocol.toLowerCase() === f.protocol);
  }
  // ... more filters

  // Apply sorting
  const { column, direction } = sortConfig.value;
  result = [...result].sort((a, b) => {
    const cmp = compareBy(column, a, b);
    return direction === 'asc' ? cmp : -cmp;
  });

  return result;
});

export const portCount = computed(() => ports.value.length);
export const filteredCount = computed(() => filteredPorts.value.length);
```

### Hooks

#### usePorts

```typescript
// hooks/usePorts.ts
export function usePorts() {
  const fetchPorts = async () => {
    isLoading.value = true;
    try {
      const result = await invoke<PortInfo[]>('get_ports');
      ports.value = result;
    } finally {
      isLoading.value = false;
    }
  };

  const scanRange = async (start: number, end: number) => {
    isLoading.value = true;
    try {
      const result = await invoke<PortInfo[]>('scan_port_range', { start, end });
      // Merge with existing ports
      const existing = new Map(ports.value.map(p => [`${p.port}-${p.protocol}`, p]));
      result.forEach(p => existing.set(`${p.port}-${p.protocol}`, p));
      ports.value = Array.from(existing.values());
    } finally {
      isLoading.value = false;
    }
  };

  const killProcess = async (pid: number, elevated: boolean) => {
    const command = elevated ? 'kill_process_elevated' : 'kill_process';
    const result = await invoke<KillResult>(command, { pid });
    if (result.status === 'Success') {
      await fetchPorts(); // Refresh after kill
    }
    return result;
  };

  return { fetchPorts, scanRange, killProcess, ports: filteredPorts };
}
```

#### useSettings

```typescript
// hooks/useSettings.ts
import { Store } from '@tauri-apps/plugin-store';

const store = new Store('settings.json');

export function useSettings() {
  const load = async () => {
    const saved = await store.get<AppSettings>('settings');
    if (saved) {
      settings.value = { ...defaultSettings, ...saved };
    }
  };

  const save = async (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
    await store.set('settings', settings.value);
    await store.save();
  };

  return { settings, load, save };
}
```

## Backend Architecture

### Directory Structure

```
src-tauri/src/
├── main.rs                 # Entry + enhanced tray setup
├── lib.rs                  # Module exports
├── commands.rs             # All Tauri command handlers
├── types.rs                # Data types (extended)
│
├── port_scanner.rs         # Port scanning (existing + range)
├── process_resolver.rs     # PID resolution (existing)
├── process_manager.rs      # Kill operations (existing)
│
├── settings.rs             # Settings management (NEW)
├── notifications.rs        # Port change detection (NEW)
└── presets.rs              # Built-in port presets (NEW)
```

### New Rust Types

```rust
// types.rs (additions)

/// Port range for scanning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortRange {
    pub start: u16,
    pub end: u16,
}

/// Preset configuration for common port ranges
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortPreset {
    pub id: String,
    pub name: String,
    pub description: String,
    pub ports: Vec<u16>,
    pub ranges: Vec<PortRange>,
}

/// Application settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub refresh_interval: u32,      // milliseconds (default: 5000)
    pub start_minimized: bool,      // start in tray (default: false)
    pub start_on_login: bool,       // autostart (default: false)
    pub notifications: NotificationSettings,
    pub display: DisplaySettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
    pub enabled: bool,
    pub sound_enabled: bool,
    pub watched_ports: Vec<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplaySettings {
    pub default_view: ViewMode,
    pub default_sort: SortColumn,
    pub default_sort_direction: SortDirection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViewMode {
    All,
    ListeningOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortColumn {
    Port,
    Process,
    Pid,
    Protocol,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortDirection {
    Asc,
    Desc,
}

/// Event emitted when port status changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortChangeEvent {
    pub port: u16,
    pub process_name: String,
    pub pid: u32,
    pub protocol: Protocol,
    pub event_type: PortEventType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PortEventType {
    Opened,
    Closed,
}
```

### New Tauri Commands

```rust
// commands.rs

use crate::{
    port_scanner::PortScanner,
    process_resolver::ProcessResolver,
    presets::get_builtin_presets,
    types::*,
};

/// Scan a specific port range
#[tauri::command]
pub fn scan_port_range(start: u16, end: u16) -> Result<Vec<PortInfo>, String> {
    if start > end {
        return Err("Start port must be less than or equal to end port".to_string());
    }
    if end > 65535 {
        return Err("Port must be <= 65535".to_string());
    }

    let raw_entries = PortScanner::scan_all().map_err(|e| e.to_string())?;
    let resolver = ProcessResolver::new();

    let ports: Vec<PortInfo> = raw_entries
        .into_iter()
        .filter(|entry| entry.local_port >= start && entry.local_port <= end)
        .filter_map(|entry| {
            let process_info = resolver.resolve(entry.inode)?;
            Some(PortInfo {
                pid: process_info.pid,
                process_name: process_info.name,
                port: entry.local_port,
                protocol: entry.protocol,
                address: entry.local_address,
                user: process_info.user,
            })
        })
        .collect();

    Ok(ports)
}

/// Get built-in port presets
#[tauri::command]
pub fn get_presets() -> Vec<PortPreset> {
    get_builtin_presets()
}

/// Get current tray statistics
#[tauri::command]
pub fn get_tray_stats() -> Result<TrayStats, String> {
    let ports = crate::get_ports()?;
    Ok(TrayStats {
        total_ports: ports.len(),
        tcp_count: ports.iter().filter(|p| p.protocol == Protocol::Tcp).count(),
        udp_count: ports.iter().filter(|p| p.protocol == Protocol::Udp).count(),
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayStats {
    pub total_ports: usize,
    pub tcp_count: usize,
    pub udp_count: usize,
}
```

### Port Presets

```rust
// presets.rs

use crate::types::{PortPreset, PortRange};

pub fn get_builtin_presets() -> Vec<PortPreset> {
    vec![
        PortPreset {
            id: "web".to_string(),
            name: "Web Servers".to_string(),
            description: "Common HTTP/HTTPS ports".to_string(),
            ports: vec![80, 443, 8080, 8443, 3000, 5000],
            ranges: vec![],
        },
        PortPreset {
            id: "dev".to_string(),
            name: "Development".to_string(),
            description: "Common development server ports".to_string(),
            ports: vec![],
            ranges: vec![
                PortRange { start: 3000, end: 3999 },
                PortRange { start: 5000, end: 5999 },
                PortRange { start: 8000, end: 9999 },
            ],
        },
        PortPreset {
            id: "database".to_string(),
            name: "Databases".to_string(),
            description: "Common database ports".to_string(),
            ports: vec![
                3306,  // MySQL
                5432,  // PostgreSQL
                27017, // MongoDB
                6379,  // Redis
                9200,  // Elasticsearch
                5984,  // CouchDB
            ],
            ranges: vec![],
        },
        PortPreset {
            id: "messaging".to_string(),
            name: "Message Queues".to_string(),
            description: "Message broker ports".to_string(),
            ports: vec![
                5672,  // RabbitMQ
                9092,  // Kafka
                4222,  // NATS
                6650,  // Pulsar
            ],
            ranges: vec![],
        },
    ]
}
```

### Enhanced Tray Setup

```rust
// main.rs (enhanced tray)

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // Preset submenu
    let preset_web = MenuItem::with_id(app, "preset_web", "Web Servers", true, None::<&str>)?;
    let preset_dev = MenuItem::with_id(app, "preset_dev", "Development", true, None::<&str>)?;
    let preset_db = MenuItem::with_id(app, "preset_database", "Databases", true, None::<&str>)?;

    let presets_menu = Menu::with_items(app, &[&preset_web, &preset_dev, &preset_db])?;
    let presets_submenu = Submenu::with_menu(app, "Quick Scan", &presets_menu)?;

    // Main menu items
    let refresh = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
    let open = MenuItem::with_id(app, "open", "Open Window", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[
        &refresh,
        &presets_submenu.as_ref(),
        &sep1,
        &open,
        &settings,
        &sep2,
        &quit,
    ])?;

    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("PortWatcher - Loading...")
        .show_menu_on_left_click(false)
        .on_tray_icon_event(handle_tray_event)
        .on_menu_event(handle_menu_event)
        .build(app)?;

    // Start background tray stats updater
    let app_handle = app.handle().clone();
    std::thread::spawn(move || {
        loop {
            if let Ok(stats) = get_tray_stats() {
                let tooltip = format!(
                    "PortWatcher\n{} ports ({} TCP, {} UDP)",
                    stats.total_ports, stats.tcp_count, stats.udp_count
                );
                // Update tooltip (requires tray handle reference)
            }
            std::thread::sleep(std::time::Duration::from_secs(5));
        }
    });

    Ok(())
}
```

## API Specification

### Tauri Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get_ports` | - | `Vec<PortInfo>` | Get all listening ports |
| `scan_port_range` | `start: u16, end: u16` | `Vec<PortInfo>` | Scan specific port range |
| `kill_process` | `pid: u32` | `KillResult` | Kill process (SIGTERM) |
| `kill_process_elevated` | `pid: u32` | `KillResult` | Kill with pkexec |
| `get_presets` | - | `Vec<PortPreset>` | Get built-in presets |
| `get_tray_stats` | - | `TrayStats` | Get port counts |

### Tauri Events

| Event | Payload | Direction | Description |
|-------|---------|-----------|-------------|
| `refresh-ports` | `()` | Backend → Frontend | Trigger refresh |
| `port-opened` | `PortChangeEvent` | Backend → Frontend | New port detected |
| `port-closed` | `PortChangeEvent` | Backend → Frontend | Port closed |
| `scan-preset` | `{ preset_id: string }` | Backend → Frontend | Scan preset triggered |

### TypeScript Interfaces

```typescript
// store/types.ts

export interface PortInfo {
  pid: number;
  process_name: string;
  port: number;
  protocol: 'Tcp' | 'Udp';
  address: string;
  user: string;
}

export interface KillResult {
  status: 'Success' | 'PermissionDenied' | 'ElevationRequired' | 'ProcessNotFound' | 'Error';
  pid?: number;
  message?: string;
}

export interface PortPreset {
  id: string;
  name: string;
  description: string;
  ports: number[];
  ranges: Array<{ start: number; end: number }>;
}

export interface AppSettings {
  refreshInterval: number;
  startMinimized: boolean;
  startOnLogin: boolean;
  notifications: {
    enabled: boolean;
    soundEnabled: boolean;
    watchedPorts: number[];
  };
  display: {
    defaultView: 'all' | 'listening';
    defaultSort: 'port' | 'process' | 'pid' | 'protocol';
    defaultSortDirection: 'asc' | 'desc';
  };
}

export interface TrayStats {
  total_ports: number;
  tcp_count: number;
  udp_count: number;
}
```

## Build Configuration

### package.json

```json
{
  "name": "portwatcher",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@preact/signals": "^1.2.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-store": "^2.0.0",
    "@tanstack/virtual-core": "^3.0.0",
    "lucide-preact": "^0.300.0",
    "preact": "^10.19.0"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.8.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#ffffff',
          dark: '#1e1e1e',
        },
      },
    },
  },
  plugins: [],
};
```

## SOLID Compliance

| Principle | Status | Implementation |
|-----------|--------|----------------|
| **SRP** | ✅ | Each module has single responsibility (scanner, resolver, settings) |
| **OCP** | ✅ | Presets extensible, filter system modular |
| **LSP** | ✅ | All commands return consistent result types |
| **ISP** | ✅ | Small, focused interfaces (hooks, components) |
| **DIP** | ✅ | Frontend depends on Tauri API abstraction, not implementation |

## Security Considerations

1. **Process Killing**: Elevation required for non-owned processes via pkexec
2. **Settings Storage**: Local file, no sensitive data
3. **IPC**: Tauri's built-in security model
4. **Input Validation**: Port range bounds checking

## Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| Initial load | <500ms | Vite bundling, tree-shaking |
| Search latency | <100ms | Debounced, computed signals |
| 1000+ ports render | 60fps | TanStack Virtual |
| Memory (1000 ports) | <50MB | Virtual DOM recycling |

## Migration Path

1. **M1**: Setup Vite + Preact + Tailwind (replace vanilla)
2. **M2**: Implement port range scanning (backend + frontend)
3. **M3**: Add search & filtering (frontend signals)
4. **M4**: Enhanced tray (backend + menu updates)
5. **M5**: Settings + notifications (store plugin)
6. **M6**: Polish & testing
