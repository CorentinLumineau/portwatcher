# PortWatcher - Implementation Workflow

## Overview

| Metric | Value |
|--------|-------|
| Total Milestones | 6 |
| Total Tasks | 15 |
| Estimated Time | 8-11 hours |
| Critical Path | Setup → Types → Scanner → Resolver → Commands → Main → Frontend |

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    Implementation Order                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   M1: Project Setup                                         │
│   └── types.rs                                              │
│           │                                                 │
│           ▼                                                 │
│   M2: Port Scanning Core                                    │
│   ├── port_scanner.rs ◄────┐                                │
│   └── process_resolver.rs ──┘                               │
│           │                                                 │
│           ▼                                                 │
│   M3: Process Management                                    │
│   └── process_manager.rs                                    │
│           │                                                 │
│           ▼                                                 │
│   M4: Tauri Integration                                     │
│   ├── commands.rs                                           │
│   ├── lib.rs                                                │
│   └── main.rs (with tray)                                   │
│           │                                                 │
│           ▼                                                 │
│   M5: Frontend                                              │
│   ├── index.html                                            │
│   ├── styles.css                                            │
│   └── main.js                                               │
│           │                                                 │
│           ▼                                                 │
│   M6: Polish & Release                                      │
│   ├── Icons                                                 │
│   └── Testing                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Milestone 1: Project Setup & Foundation

**Goal**: Working Tauri v2 project skeleton with all dependencies configured.

### Task 1.1: Initialize Tauri v2 Project

```bash
/x:implement "Initialize Tauri v2 project with Rust backend: Create project structure with src-tauri/ and src/ directories, configure Cargo.toml with tauri 2, serde, procfs, nix, and users crates, setup tauri.conf.json with tray-icon capability and window configuration (400x500, hidden on start)"
```

**Deliverables**:
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src-tauri/build.rs`
- `src-tauri/src/` directory

**Acceptance Criteria**:
- [ ] `cargo check` passes in src-tauri/
- [ ] Tauri v2 dependencies resolved

---

### Task 1.2: Create Shared Types

```bash
/x:implement "Create types.rs with PortInfo struct (pid, process_name, port, protocol, address, user), Protocol enum (Tcp, Udp), KillResult enum (Success, PermissionDenied, ElevationRequired, ProcessNotFound, Error), and RawSocketEntry struct. All types derive Serialize, Deserialize, Debug, Clone"
```

**Deliverables**:
- `src-tauri/src/types.rs`

**Acceptance Criteria**:
- [ ] All types compile
- [ ] Serde derives work correctly

---

## Milestone 2: Port Scanning Core

**Goal**: Ability to list all listening TCP/UDP ports with process information.

### Task 2.1: Implement Port Scanner

```bash
/x:implement "Create port_scanner.rs that parses /proc/net/tcp and /proc/net/udp to extract listening sockets. Implement PortScanner struct with scan_all() returning Vec<RawSocketEntry>, parse_tcp() and parse_udp() private methods. Filter for LISTEN state (0x0A) only. Handle hex address/port parsing."
```

**Deliverables**:
- `src-tauri/src/port_scanner.rs`

**Acceptance Criteria**:
- [ ] Can parse /proc/net/tcp
- [ ] Can parse /proc/net/udp
- [ ] Returns port, address, inode for each listening socket

---

### Task 2.2: Implement Process Resolver

```bash
/x:implement "Create process_resolver.rs that maps socket inodes to process info. Implement ProcessResolver with resolve(inode) returning Option<ProcessInfo>, build_inode_map() scanning /proc/[pid]/fd/ symlinks for socket inodes, and get_process_info(pid) reading /proc/[pid]/comm for name and /proc/[pid]/status for user"
```

**Deliverables**:
- `src-tauri/src/process_resolver.rs`

**Acceptance Criteria**:
- [ ] Can map inode to PID
- [ ] Can get process name from /proc/[pid]/comm
- [ ] Can get user from process

---

### Task 2.3: Unit Tests for Scanner & Resolver

```bash
/x:implement "Add unit tests for port_scanner.rs and process_resolver.rs. Test TCP/UDP line parsing with sample /proc/net/ format, test hex to decimal conversion, test inode extraction. Use mock data where possible."
```

**Deliverables**:
- Tests in `src-tauri/src/port_scanner.rs` (mod tests)
- Tests in `src-tauri/src/process_resolver.rs` (mod tests)

**Acceptance Criteria**:
- [ ] `cargo test` passes
- [ ] Core parsing logic tested

---

## Milestone 3: Process Management

**Goal**: Ability to kill processes with proper privilege handling.

### Task 3.1: Implement Process Manager

```bash
/x:implement "Create process_manager.rs with ProcessManager struct. Implement kill(pid) using nix::sys::signal to send SIGTERM, then SIGKILL after timeout. Implement kill_elevated(pid) using std::process::Command to spawn pkexec with kill command. Add is_owned_by_current_user(pid) check using users crate."
```

**Deliverables**:
- `src-tauri/src/process_manager.rs`

**Acceptance Criteria**:
- [ ] Can send SIGTERM to owned processes
- [ ] Returns PermissionDenied for other users' processes
- [ ] kill_elevated spawns pkexec correctly

---

## Milestone 4: Tauri Commands & Main

**Goal**: Backend fully functional with system tray.

### Task 4.1: Implement Tauri Commands

```bash
/x:implement "Create commands.rs with Tauri IPC handlers: get_ports() that uses PortScanner and ProcessResolver to return Vec<PortInfo>, kill_process(pid) that uses ProcessManager::kill(), and kill_process_elevated(pid) that uses ProcessManager::kill_elevated(). Add proper error handling returning Result or KillResult."
```

**Deliverables**:
- `src-tauri/src/commands.rs`

**Acceptance Criteria**:
- [ ] get_ports returns valid PortInfo list
- [ ] kill_process works for owned processes
- [ ] kill_process_elevated invokes pkexec

---

### Task 4.2: Implement lib.rs Module Exports

```bash
/x:implement "Create lib.rs that declares all modules (types, port_scanner, process_resolver, process_manager, commands) and re-exports the Tauri commands for use in main.rs"
```

**Deliverables**:
- `src-tauri/src/lib.rs`

**Acceptance Criteria**:
- [ ] All modules accessible
- [ ] Commands exported

---

### Task 4.3: Implement Main with System Tray

```bash
/x:implement "Create main.rs with Tauri app setup: Configure system tray using TrayIconBuilder with left-click to toggle window visibility and right-click menu (Refresh, Open Window, separator, Quit). Setup window as initially hidden. Register all commands with invoke_handler. Handle tray menu events."
```

**Deliverables**:
- `src-tauri/src/main.rs`

**Acceptance Criteria**:
- [ ] App starts with tray icon
- [ ] Left-click toggles window
- [ ] Right-click shows menu
- [ ] Quit exits app

---

## Milestone 5: Frontend UI

**Goal**: Working UI with port list and kill functionality.

### Task 5.1: Create HTML Structure

```bash
/x:implement "Create src/index.html with header (title, refresh button), main section with port table (columns: Process, PID, Port, Protocol, Action), and footer with status and last refresh time. Link to styles.css and main.js"
```

**Deliverables**:
- `src/index.html`

**Acceptance Criteria**:
- [ ] Valid HTML5 structure
- [ ] Table with correct columns
- [ ] Refresh button present

---

### Task 5.2: Create CSS Styles

```bash
/x:implement "Create src/styles.css with clean, minimal styling: system font stack, subtle colors, table with hover states, kill button in red/danger color, responsive layout for 400px width, dark mode support via prefers-color-scheme"
```

**Deliverables**:
- `src/styles.css`

**Acceptance Criteria**:
- [ ] Clean, readable table
- [ ] Kill button visually distinct
- [ ] Works in light and dark mode

---

### Task 5.3: Implement Frontend JavaScript

```bash
/x:implement "Create src/main.js using Tauri invoke API: loadPorts() calling get_ports and rendering table rows, killProcess(pid) with confirmation then calling kill_process or kill_process_elevated on permission error, escapeHtml() for XSS prevention, refresh button handler, auto-refresh every 5 seconds when window visible"
```

**Deliverables**:
- `src/main.js`

**Acceptance Criteria**:
- [ ] Loads and displays ports on start
- [ ] Kill button works with confirmation
- [ ] Handles permission errors gracefully
- [ ] Refresh updates the list

---

## Milestone 6: Polish & Integration

**Goal**: Release-ready application.

### Task 6.1: Add Application Icons

```bash
/x:implement "Create or generate app icons: 32x32 PNG for tray icon (simple network/port symbol), standard app icon sizes (32, 128, 256, 512) for window icon. Place in src-tauri/icons/. Update tauri.conf.json to reference icons."
```

**Deliverables**:
- `src-tauri/icons/icon.png` (multiple sizes)
- `src-tauri/icons/tray-icon.png`
- Updated `tauri.conf.json`

**Acceptance Criteria**:
- [ ] Tray shows custom icon
- [ ] Window has app icon

---

### Task 6.2: End-to-End Testing

```bash
/x:implement "Test full application flow: 1) App starts with tray icon, 2) Left-click opens window with port list, 3) Kill own process works, 4) Kill other user's process prompts pkexec, 5) Refresh updates list, 6) Right-click menu works, 7) Quit exits cleanly"
```

**Deliverables**:
- Verified working application

**Acceptance Criteria**:
- [ ] All user flows work
- [ ] No crashes or errors
- [ ] Memory usage < 50MB idle

---

### Task 6.3: Build Release

```bash
/x:implement "Build release binary: cargo tauri build --release. Verify .deb package generated. Test installation on clean Ubuntu system. Document any runtime dependencies (libappindicator3)."
```

**Deliverables**:
- `src-tauri/target/release/portwatcher`
- `.deb` package

**Acceptance Criteria**:
- [ ] Release builds successfully
- [ ] Can install and run on Ubuntu 22.04+

---

## Quick Start

Run these commands in sequence:

```bash
# Milestone 1
/x:implement "Initialize Tauri v2 project with Rust backend..."
/x:implement "Create types.rs with PortInfo struct..."

# Milestone 2
/x:implement "Create port_scanner.rs that parses /proc/net/tcp..."
/x:implement "Create process_resolver.rs that maps socket inodes..."

# Milestone 3
/x:implement "Create process_manager.rs with ProcessManager struct..."

# Milestone 4
/x:implement "Create commands.rs with Tauri IPC handlers..."
/x:implement "Create lib.rs that declares all modules..."
/x:implement "Create main.rs with Tauri app setup..."

# Milestone 5
/x:implement "Create src/index.html with header..."
/x:implement "Create src/styles.css with clean styling..."
/x:implement "Create src/main.js using Tauri invoke API..."

# Milestone 6
/x:implement "Create or generate app icons..."
/x:implement "Build release binary..."
```

---

## Verification Checklist

### Per-Milestone Verification

- [ ] **M1**: `cargo check` passes
- [ ] **M2**: `cargo test` passes, can list ports in test
- [ ] **M3**: Can kill test process
- [ ] **M4**: Tray icon appears, window toggles
- [ ] **M5**: UI renders, kill button works
- [ ] **M6**: Release binary runs on Ubuntu

### Final Verification

- [ ] Memory < 50MB idle
- [ ] Refresh < 1 second
- [ ] All listening ports shown
- [ ] Kill works for owned processes
- [ ] pkexec prompt for other processes
- [ ] Clean quit from tray menu

---

**Created**: 2024-12-16
**Status**: Ready for Implementation
