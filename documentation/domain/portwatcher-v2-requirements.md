# PortWatcher v2.0 Requirements

## Business Value

**Problem**: Current PortWatcher provides basic port listing but lacks:
- Ability to scan specific port ranges
- Search and filtering for large port lists
- Modern, responsive UI
- Proactive notifications

**Solution**: Enhanced PortWatcher with advanced scanning, filtering, modern Preact UI, and desktop notifications.

## User Stories

### Core (MVP)
- As a developer, I want to **scan a specific port range** so I can find which services are using ports 3000-9000
- As a user, I want to **search/filter ports** by process name, port number, or protocol so I can quickly find what I'm looking for
- As a user, I want a **modern, responsive UI** that handles large port lists efficiently
- As a user, I want **enhanced tray indicators** showing port activity at a glance

### Phase 2
- As a user, I want **notifications** when watched ports become active
- As a user, I want a **settings panel** to configure refresh intervals and preferences

## Core Requirements (MVP)

### 1. Port Range Scanning
- Custom range input (e.g., "3000-4000")
- Preset ranges:
  - Web: 80, 443, 8080, 8443
  - Development: 3000-3999, 5000-5999, 8000-9999
  - Database: 3306, 5432, 27017, 6379
- Show all ports vs listening only toggle
- Scan on-demand with progress indicator

### 2. Search & Filtering
- Real-time search across all columns
- Filter by:
  - Protocol (TCP/UDP/All)
  - State (LISTEN/ESTABLISHED/All)
  - User (current user/all users)
- Sortable columns (port, process, PID, protocol)
- Clear filters button

### 3. UI Modernization (Preact + Tailwind)
- Component architecture:
  - `<PortTable />` - Main data grid with virtual scrolling
  - `<SearchBar />` - Real-time search input
  - `<FilterPanel />` - Protocol/state filters
  - `<RangeScanner />` - Port range input
  - `<SettingsModal />` - Configuration panel
- TailwindCSS for styling
- Dark/light mode (system preference)
- Responsive layout
- Virtual scrolling for 1000+ ports

### 4. Enhanced System Tray
- Tooltip showing: "X ports listening"
- Tray icon badge/indicator for new ports
- Context menu additions:
  - Recent killed processes (last 5)
  - Quick scan presets
  - Open settings

## Phase 2 Requirements

### 5. Desktop Notifications
- Notification when new port starts listening
- Configurable watchlist (specific ports to monitor)
- Notification settings:
  - Enable/disable
  - Sound on/off
  - Watched ports list

### 6. Settings Panel
- General:
  - Refresh interval (1s, 5s, 10s, 30s)
  - Start minimized to tray
  - Start on login
- Notifications:
  - Enable notifications
  - Watched ports list
  - Sound alerts
- Display:
  - Default view (all/listening)
  - Default sort column

## Technical Specifications

### Frontend Stack
| Component | Technology |
|-----------|------------|
| Framework | Preact 10.x |
| Build Tool | Vite 5.x |
| Styling | TailwindCSS 3.x |
| State | Preact Signals |
| Icons | Lucide Icons |

### New Rust Commands
```rust
// Port range scanning
#[tauri::command]
fn scan_port_range(start: u16, end: u16) -> Vec<PortInfo>;

// Get port presets
#[tauri::command]
fn get_port_presets() -> Vec<PortPreset>;

// Settings management
#[tauri::command]
fn get_settings() -> AppSettings;

#[tauri::command]
fn save_settings(settings: AppSettings) -> Result<(), String>;

// Notification events (emitted from Rust)
// Event: "port-opened" { port, process, pid }
// Event: "port-closed" { port, process, pid }
```

### Data Types
```typescript
interface PortPreset {
  name: string;
  ports: number[];
  ranges: [number, number][];
}

interface AppSettings {
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
    defaultSort: 'port' | 'process' | 'pid';
  };
}
```

## Success Criteria

- [ ] Port range scanning works for any valid range
- [ ] Search filters 500+ ports in <100ms
- [ ] UI renders smoothly with 1000+ ports (virtual scroll)
- [ ] Tray tooltip updates in real-time
- [ ] Settings persist across restarts
- [ ] Notifications trigger within 5s of port change (Phase 2)

## Out of Scope (Future v3.0)

- History & logging with SQLite persistence
- Export to CSV/JSON
- Network interface filtering
- Remote port checking (external hosts)
- Process tree view
- Multi-window support

## Milestones

| Milestone | Features | Estimate |
|-----------|----------|----------|
| M1: UI Foundation | Preact setup, TailwindCSS, basic components | - |
| M2: Port Range Scanning | Range input, presets, backend commands | - |
| M3: Search & Filtering | Search bar, filters, sorting | - |
| M4: Enhanced Tray | Tooltip stats, quick actions, indicators | - |
| M5: Settings & Notifications | Settings panel, desktop notifications | - |
| M6: Polish | Testing, performance optimization, docs | - |

## Migration Notes

### From v1.0 to v2.0
- Replace `src/` vanilla JS with Preact components
- Add Vite as build tool
- Update `tauri.conf.json` for new build process
- Extend Rust backend with new commands
- Preserve existing kill functionality
