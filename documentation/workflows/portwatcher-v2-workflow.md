# PortWatcher v2.0 Implementation Workflow

## Overview

Transform PortWatcher from vanilla JS to modern Preact + TailwindCSS with enhanced features.

**Architecture**: [portwatcher-v2-architecture.md](../implementation/portwatcher-v2-architecture.md)

## Dependency Graph

```
M1: UI Foundation
    │
    ├── M2: Port Range Scanning (depends on M1)
    │       │
    │       └── M3: Search & Filtering (depends on M2)
    │               │
    │               └── M4: Enhanced Tray (depends on M3)
    │                       │
    │                       └── M5: Settings (depends on M4)
    │                               │
    │                               └── M6: Polish (depends on M5)
```

---

## M1: UI Foundation

**Goal**: Setup Vite + Preact + TailwindCSS build system

### Task 1.1: Initialize Frontend Build System

```bash
/x:implement "Setup Vite + Preact + TailwindCSS build system for PortWatcher v2. Create package.json with dependencies (preact, @preact/signals, @tauri-apps/api, @tauri-apps/plugin-store, @tanstack/virtual-core, lucide-preact, tailwindcss, vite, @preact/preset-vite). Create vite.config.ts, tailwind.config.js, postcss.config.js. Setup TypeScript with tsconfig.json."
```

**Deliverables**:
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration for Preact
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS for Tailwind
- `tsconfig.json` - TypeScript configuration

### Task 1.2: Create Entry Points and App Shell

```bash
/x:implement "Create Preact entry points: src/index.html with Vite script, src/main.tsx bootstrapping Preact app, src/app.tsx root component with dark mode support, src/styles/index.css with Tailwind directives. Also create src/vite-env.d.ts for Vite types."
```

**Deliverables**:
- `src/index.html` - HTML entry with Vite script
- `src/main.tsx` - App bootstrap
- `src/app.tsx` - Root component
- `src/styles/index.css` - Tailwind entry
- `src/vite-env.d.ts` - Vite type definitions

### Task 1.3: Create TypeScript Types

```bash
/x:implement "Create src/store/types.ts with all TypeScript interfaces for PortWatcher v2: PortInfo, KillResult, PortPreset, PortRange, AppSettings, NotificationSettings, DisplaySettings, TrayStats, FilterState, SortConfig, SortColumn, SortDirection."
```

**Deliverables**:
- `src/store/types.ts` - All TypeScript interfaces

### Task 1.4: Create Common UI Components

```bash
/x:implement "Create reusable UI components in src/components/common/ with TailwindCSS: Button.tsx (variants: primary, secondary, danger, ghost; sizes: sm, md, lg), Input.tsx (with label, error state), Select.tsx (dropdown), Modal.tsx (dialog with overlay, close button), Tooltip.tsx (hover tooltip). Export all from index.ts."
```

**Deliverables**:
- `src/components/common/Button.tsx`
- `src/components/common/Input.tsx`
- `src/components/common/Select.tsx`
- `src/components/common/Modal.tsx`
- `src/components/common/Tooltip.tsx`
- `src/components/common/index.ts`

### Task 1.5: Update Tauri Configuration

```bash
/x:implement "Update src-tauri/tauri.conf.json for Vite build: change frontendDist to '../dist', set beforeBuildCommand to 'npm run build', set beforeDevCommand to 'npm run dev'. Ensure window settings are preserved."
```

**Deliverables**:
- `src-tauri/tauri.conf.json` - Updated for Vite

### Verification M1

```bash
/x:verify "Verify M1 UI Foundation: npm install succeeds, npm run dev starts Vite server on port 1420, cargo tauri dev launches app with Preact UI, TailwindCSS classes work, dark mode toggles based on system preference."
```

---

## M2: Port Range Scanning

**Goal**: Add port range scanning to backend and frontend

### Task 2.1: Extend Rust Types

```bash
/x:implement "Extend src-tauri/src/types.rs with new types for v2: PortRange (start, end), PortPreset (id, name, description, ports, ranges), AppSettings with nested NotificationSettings and DisplaySettings, ViewMode enum (All, ListeningOnly), SortColumn enum, SortDirection enum, TrayStats struct. Add tests for serialization."
```

**Deliverables**:
- `src-tauri/src/types.rs` - Extended with new types

### Task 2.2: Create Port Presets Module

```bash
/x:implement "Create src-tauri/src/presets.rs with get_builtin_presets() function returning Vec<PortPreset>. Include presets: Web Servers (80, 443, 8080, 8443, 3000, 5000), Development (ranges 3000-3999, 5000-5999, 8000-9999), Databases (3306, 5432, 27017, 6379, 9200), Message Queues (5672, 9092, 4222, 6650). Export in lib.rs."
```

**Deliverables**:
- `src-tauri/src/presets.rs` - Built-in presets

### Task 2.3: Add New Tauri Commands

```bash
/x:implement "Add new Tauri commands: scan_port_range(start: u16, end: u16) -> Result<Vec<PortInfo>> that filters ports by range, get_presets() -> Vec<PortPreset> returning built-in presets, get_tray_stats() -> TrayStats with port counts. Add validation for port range bounds. Register commands in main.rs invoke_handler."
```

**Deliverables**:
- Commands added to `src-tauri/src/main.rs`
- Tests for new commands

### Task 2.4: Create Tauri Invoke Wrappers

```bash
/x:implement "Create src/lib/tauri.ts with typed wrapper functions for all Tauri commands: getPorts(), scanPortRange(start, end), killProcess(pid), killProcessElevated(pid), getPresets(), getTrayStats(). Use @tauri-apps/api invoke with proper TypeScript generics. Handle errors consistently."
```

**Deliverables**:
- `src/lib/tauri.ts` - Typed invoke wrappers

### Task 2.5: Create RangeScanner Component

```bash
/x:implement "Create src/components/RangeScanner.tsx: two number inputs for start/end port, preset dropdown using Select component, Scan button with loading state. Props: onScan(start, end), presets, isScanning. Validate start < end, ports 1-65535. Use Lucide icons for visual feedback."
```

**Deliverables**:
- `src/components/RangeScanner.tsx`

### Verification M2

```bash
/x:verify "Verify M2 Port Range Scanning: cargo test passes for new types and commands, scan_port_range returns only ports in specified range, get_presets returns 4 built-in presets, RangeScanner component renders with presets dropdown."
```

---

## M3: Search & Filtering

**Goal**: Implement search, filtering, and virtual scrolling

### Task 3.1: Create Signals Store

```bash
/x:implement "Create src/store/signals.ts with Preact Signals: ports signal (PortInfo[]), searchQuery signal (string), filters signal (FilterState), sortConfig signal (SortConfig), settings signal (AppSettings), isLoading signal (boolean). Add computed signals: filteredPorts (applies search, filters, sorting), portCount, filteredCount. Include filter and sort logic."
```

**Deliverables**:
- `src/store/signals.ts` - Global state with Preact Signals

### Task 3.2: Create usePorts Hook

```bash
/x:implement "Create src/hooks/usePorts.ts hook: fetchPorts() loads all ports, scanRange(start, end) scans and merges with existing, killProcess(pid, elevated) kills and refreshes. Use signals from store. Handle loading state. Return { fetchPorts, scanRange, killProcess, ports: filteredPorts }."
```

**Deliverables**:
- `src/hooks/usePorts.ts`

### Task 3.3: Create Filter Hooks

```bash
/x:implement "Create src/hooks/useFilters.ts: manages filter state signal, provides setProtocolFilter, setStateFilter, setUserFilter, setPortRange, clearFilters functions. Create src/hooks/useSorting.ts: manages sortConfig signal, provides toggleSort(column), setSortDirection functions."
```

**Deliverables**:
- `src/hooks/useFilters.ts`
- `src/hooks/useSorting.ts`

### Task 3.4: Create SearchBar Component

```bash
/x:implement "Create src/components/SearchBar.tsx: text input with search icon (Lucide Search), clear button when has value, debounced onChange (150ms), keyboard shortcut Ctrl+K to focus. Props: value, onChange, placeholder. Style with TailwindCSS, support dark mode."
```

**Deliverables**:
- `src/components/SearchBar.tsx`
- `src/lib/utils.ts` - debounce function

### Task 3.5: Create FilterPanel Component

```bash
/x:implement "Create src/components/FilterPanel.tsx: three Select dropdowns for Protocol (All/TCP/UDP), State (All/Listen), User (All/Current User). Clear Filters button. Props: filters, onChange, onClear. Compact horizontal layout with TailwindCSS."
```

**Deliverables**:
- `src/components/FilterPanel.tsx`

### Task 3.6: Create PortTable with Virtual Scroll

```bash
/x:implement "Create src/components/PortTable/ with TanStack Virtual: PortTable.tsx (container with useVirtualizer, renders visible rows only), TableHeader.tsx (sortable column headers with sort indicators), PortRow.tsx (single port row with Kill button). Support 10,000+ rows at 60fps. Props: ports, onKill, sortColumn, sortDirection, onSort."
```

**Deliverables**:
- `src/components/PortTable/PortTable.tsx`
- `src/components/PortTable/TableHeader.tsx`
- `src/components/PortTable/PortRow.tsx`
- `src/components/PortTable/index.ts`

### Task 3.7: Integrate All Components in App

```bash
/x:implement "Update src/app.tsx to integrate all components: SearchBar at top, FilterPanel below, RangeScanner, PortTable as main content. Wire up signals and hooks. Add auto-refresh on mount and interval (5s default). Handle loading and empty states."
```

**Deliverables**:
- `src/app.tsx` - Fully integrated app

### Verification M3

```bash
/x:verify "Verify M3 Search & Filtering: search filters ports in real-time (<100ms), protocol filter works, sorting toggles asc/desc, virtual scroll handles 1000+ ports smoothly, clear filters resets all."
```

---

## M4: Enhanced Tray

**Goal**: Improve system tray with stats and preset quick actions

### Task 4.1: Add Tray Stats Command

```bash
/x:implement "Ensure get_tray_stats command returns TrayStats with total_ports, tcp_count, udp_count. Add background thread in main.rs setup that updates tray tooltip every 5 seconds with format 'PortWatcher\\nX ports (Y TCP, Z UDP)'."
```

**Deliverables**:
- Tray tooltip updates with stats

### Task 4.2: Create Tray Preset Submenu

```bash
/x:implement "Enhance tray menu in main.rs: add 'Quick Scan' submenu with preset items (Web Servers, Development, Databases, Message Queues). Handle preset menu events by emitting 'scan-preset' event to frontend with preset_id."
```

**Deliverables**:
- Tray submenu for presets
- Event emission for preset selection

### Task 4.3: Create StatusBar Component

```bash
/x:implement "Create src/components/StatusBar.tsx: displays port count (showing X of Y ports), last refresh time, refresh button. Uses portCount and filteredCount from signals. Compact footer style with TailwindCSS."
```

**Deliverables**:
- `src/components/StatusBar.tsx`

### Task 4.4: Handle Tray Events in Frontend

```bash
/x:implement "Create src/hooks/useTauriEvents.ts: listens to 'refresh-ports' and 'scan-preset' events from tray. On refresh-ports, call fetchPorts(). On scan-preset, expand preset and scan all its ports/ranges. Use @tauri-apps/api/event listen function."
```

**Deliverables**:
- `src/hooks/useTauriEvents.ts`

### Verification M4

```bash
/x:verify "Verify M4 Enhanced Tray: tray tooltip shows port counts, Quick Scan submenu appears on right-click, clicking preset triggers scan in UI, StatusBar shows correct counts, refresh button works."
```

---

## M5: Settings & Notifications

**Goal**: Implement settings persistence with tauri-plugin-store

### Task 5.1: Add Tauri Store Plugin

```bash
/x:implement "Add tauri-plugin-store to src-tauri/Cargo.toml. Update tauri.conf.json plugins section. Initialize store plugin in main.rs. Verify plugin loads correctly."
```

**Deliverables**:
- `src-tauri/Cargo.toml` - Store plugin dependency
- Plugin initialization

### Task 5.2: Create useSettings Hook

```bash
/x:implement "Create src/hooks/useSettings.ts: uses @tauri-apps/plugin-store Store class. Provides load() to read settings from 'settings.json', save(partial) to merge and persist settings. Returns { settings signal, load, save }. Apply default settings if none exist."
```

**Deliverables**:
- `src/hooks/useSettings.ts`

### Task 5.3: Create SettingsModal Component

```bash
/x:implement "Create src/components/SettingsModal.tsx: tabbed interface with General (refresh interval dropdown, start minimized checkbox), Display (default view, default sort), Notifications (enable toggle, watched ports input). Save and Cancel buttons. Uses Modal from common components."
```

**Deliverables**:
- `src/components/SettingsModal.tsx`

### Task 5.4: Wire Up Settings

```bash
/x:implement "Update app.tsx: load settings on mount, apply refresh interval to auto-refresh, open SettingsModal from gear icon button. Add Settings menu item to tray that opens modal. Persist settings on save."
```

**Deliverables**:
- Settings integration in app

### Verification M5

```bash
/x:verify "Verify M5 Settings: settings modal opens from UI and tray, changing refresh interval affects auto-refresh timing, settings persist after app restart, default values applied for new installs."
```

---

## M6: Polish & Testing

**Goal**: Production-ready release with optimizations

### Task 6.1: Performance Optimization

```bash
/x:implement "Optimize PortWatcher v2 performance: add useMemo for expensive filter computations, implement lazy loading for SettingsModal, ensure virtual scroll maintains 60fps with 5000+ ports. Profile and fix any bottlenecks."
```

**Deliverables**:
- Performance optimizations applied

### Task 6.2: Dark Mode Polish

```bash
/x:implement "Polish dark/light mode: ensure all components have proper dark variants, smooth transitions between modes, consistent color scheme (use Tailwind dark: prefix), readable text contrast in both modes."
```

**Deliverables**:
- Consistent dark mode styling

### Task 6.3: Keyboard Shortcuts

```bash
/x:implement "Add keyboard shortcuts: Ctrl+K focuses search, Escape closes modals and clears search, Ctrl+R refreshes ports, Ctrl+, opens settings. Show keyboard hints in tooltips."
```

**Deliverables**:
- Keyboard shortcuts implemented

### Task 6.4: Error Handling

```bash
/x:implement "Add comprehensive error handling: toast notifications for kill failures, retry logic for failed port fetches, graceful degradation when tray stats fail, user-friendly error messages."
```

**Deliverables**:
- Error handling and user feedback

### Task 6.5: Update Documentation

```bash
/x:implement "Update documentation for v2.0: update README.md with new features and screenshots, update CHANGELOG.md, update architecture docs if implementation differs, bump version to 2.0.0 in package.json and tauri.conf.json."
```

**Deliverables**:
- Updated documentation
- Version bump to 2.0.0

### Final Verification

```bash
/x:verify "Final verification for PortWatcher v2.0: all features working (range scan, search, filter, sort, virtual scroll, settings, tray), no console errors, dark mode consistent, performance targets met (<500ms load, <100ms search, 60fps scroll), cargo test passes, npm run build succeeds."
```

---

## Summary

| Milestone | Tasks | Key Deliverables |
|-----------|-------|------------------|
| M1: UI Foundation | 5 | Vite + Preact + Tailwind setup |
| M2: Port Range Scanning | 5 | Backend commands + RangeScanner |
| M3: Search & Filtering | 7 | Signals + Hooks + PortTable |
| M4: Enhanced Tray | 4 | Stats tooltip + preset submenu |
| M5: Settings | 4 | Store plugin + SettingsModal |
| M6: Polish | 5 | Performance + DX + docs |

**Total**: 30 tasks across 6 milestones

## Quick Start

Begin implementation:
```bash
/x:implement "Setup Vite + Preact + TailwindCSS build system for PortWatcher v2..."
```

Or create initiative tracking:
```bash
/x:initiative portwatcher-v2
```
