# PortWatcher - Technical Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Tauri | v2 |
| Backend | Rust | 1.75+ |
| Frontend | Vanilla JS | ES2022 |
| Styling | CSS | Custom |
| Target OS | Linux (Ubuntu 22.04+) | Primary |

## Project Structure

```
portwatcher/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── icons/
│   │   ├── icon.png          # App icon
│   │   └── tray-icon.png     # System tray icon
│   └── src/
│       ├── main.rs           # Entry point, tray setup
│       ├── lib.rs            # Module exports
│       ├── commands.rs       # Tauri IPC commands
│       ├── port_scanner.rs   # /proc/net parsing
│       ├── process_resolver.rs # Inode → PID resolution
│       ├── process_manager.rs  # Kill operations
│       └── types.rs          # Shared data types
├── src/
│   ├── index.html            # Main UI
│   ├── styles.css            # Styling
│   └── main.js               # Frontend logic
└── documentation/
```

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         PortWatcher                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌────────────────────────────┐   │
│  │   System Tray    │         │      Rust Backend          │   │
│  │  ┌────────────┐  │         │                            │   │
│  │  │ Left-click │──┼────────►│  ┌──────────────────────┐  │   │
│  │  └────────────┘  │  show   │  │    commands.rs       │  │   │
│  │  ┌────────────┐  │  window │  │  ──────────────────  │  │   │
│  │  │Right-click │  │         │  │  get_ports()         │  │   │
│  │  │   Menu     │  │         │  │  kill_process()      │  │   │
│  │  │ ─────────  │  │         │  │  kill_elevated()     │  │   │
│  │  │ Refresh    │──┼────────►│  └──────────┬───────────┘  │   │
│  │  │ Open Window│  │         │             │              │   │
│  │  │ ───────    │  │         │             ▼              │   │
│  │  │ Quit       │  │         │  ┌──────────────────────┐  │   │
│  │  └────────────┘  │         │  │   port_scanner.rs    │  │   │
│  └──────────────────┘         │  │  ──────────────────  │  │   │
│                               │  │  /proc/net/tcp       │  │   │
│  ┌──────────────────┐         │  │  /proc/net/udp       │  │   │
│  │   WebView UI     │         │  └──────────┬───────────┘  │   │
│  │  ┌────────────┐  │         │             │              │   │
│  │  │  main.js   │◄─┼─────────┼─────────────┤              │   │
│  │  └────────────┘  │  IPC    │             ▼              │   │
│  │        │         │         │  ┌──────────────────────┐  │   │
│  │        ▼         │         │  │ process_resolver.rs  │  │   │
│  │  ┌────────────┐  │         │  │  ──────────────────  │  │   │
│  │  │ index.html │  │         │  │  /proc/[pid]/fd/     │  │   │
│  │  │ ────────── │  │         │  │  /proc/[pid]/comm    │  │   │
│  │  │ Port Table │  │         │  └──────────┬───────────┘  │   │
│  │  │ ┌────────┐ │  │         │             │              │   │
│  │  │ │App│Port│ │  │         │             ▼              │   │
│  │  │ │───│────│ │  │         │  ┌──────────────────────┐  │   │
│  │  │ │...|....│ │  │         │  │  process_manager.rs  │  │   │
│  │  │ └────────┘ │  │         │  │  ──────────────────  │  │   │
│  │  └────────────┘  │         │  │  kill(pid)           │  │   │
│  └──────────────────┘         │  │  pkexec kill         │  │   │
│                               │  └──────────────────────┘  │   │
└────────────────────────────────────────────────────────────────┘
```

## Data Types

### Rust Types (`types.rs`)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub pid: u32,
    pub process_name: String,
    pub port: u16,
    pub protocol: Protocol,
    pub address: String,
    pub user: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    Tcp,
    Udp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KillResult {
    Success,
    PermissionDenied { pid: u32 },
    ElevationRequired { pid: u32 },
    ProcessNotFound { pid: u32 },
    Error { message: String },
}
```

### Frontend Types (`main.js`)

```javascript
/**
 * @typedef {Object} PortInfo
 * @property {number} pid
 * @property {string} process_name
 * @property {number} port
 * @property {'Tcp'|'Udp'} protocol
 * @property {string} address
 * @property {string} user
 */

/**
 * @typedef {Object} KillResult
 * @property {'Success'|'PermissionDenied'|'ElevationRequired'|'ProcessNotFound'|'Error'} status
 */
```

## Module Specifications

### 1. Port Scanner (`port_scanner.rs`)

**Responsibility**: Parse Linux `/proc/net/` files to extract listening sockets.

```rust
pub struct PortScanner;

impl PortScanner {
    /// Scan all listening TCP and UDP ports
    pub fn scan_all() -> Result<Vec<RawSocketEntry>, ScanError>;

    /// Parse /proc/net/tcp
    fn parse_tcp() -> Result<Vec<RawSocketEntry>, ScanError>;

    /// Parse /proc/net/udp
    fn parse_udp() -> Result<Vec<RawSocketEntry>, ScanError>;
}

pub struct RawSocketEntry {
    pub local_address: String,
    pub local_port: u16,
    pub inode: u64,
    pub protocol: Protocol,
}
```

**SOLID**: SRP - Only handles socket file parsing.

### 2. Process Resolver (`process_resolver.rs`)

**Responsibility**: Map socket inodes to process information.

```rust
pub struct ProcessResolver;

impl ProcessResolver {
    /// Resolve inode to process info
    pub fn resolve(inode: u64) -> Option<ProcessInfo>;

    /// Build inode → PID mapping from /proc/[pid]/fd/
    fn build_inode_map() -> HashMap<u64, u32>;

    /// Get process details from /proc/[pid]/
    fn get_process_info(pid: u32) -> Option<ProcessInfo>;
}

pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub user: String,
}
```

**SOLID**: SRP - Only handles process resolution.

### 3. Process Manager (`process_manager.rs`)

**Responsibility**: Kill processes with proper privilege handling.

```rust
pub struct ProcessManager;

impl ProcessManager {
    /// Kill process with SIGTERM, then SIGKILL if needed
    pub fn kill(pid: u32) -> KillResult;

    /// Kill using pkexec for elevated privileges
    pub fn kill_elevated(pid: u32) -> KillResult;

    /// Check if process is owned by current user
    fn is_owned_by_current_user(pid: u32) -> bool;
}
```

**SOLID**: SRP - Only handles process termination.

### 4. Commands (`commands.rs`)

**Responsibility**: Tauri IPC command handlers.

```rust
use tauri::command;

#[command]
pub async fn get_ports() -> Result<Vec<PortInfo>, String>;

#[command]
pub async fn kill_process(pid: u32) -> KillResult;

#[command]
pub async fn kill_process_elevated(pid: u32) -> KillResult;
```

**SOLID**: ISP - Minimal interface exposed to frontend.

## Tauri IPC Interface

### Commands (Frontend → Backend)

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get_ports` | none | `PortInfo[]` | Get all listening ports |
| `kill_process` | `pid: u32` | `KillResult` | Kill process (normal) |
| `kill_process_elevated` | `pid: u32` | `KillResult` | Kill with pkexec |

### Usage in Frontend

```javascript
import { invoke } from '@tauri-apps/api/core';

// Get ports
const ports = await invoke('get_ports');

// Kill process
const result = await invoke('kill_process', { pid: 1234 });

// Kill with elevation
const result = await invoke('kill_process_elevated', { pid: 1234 });
```

## System Tray Configuration

### Tray Setup (`main.rs`)

```rust
use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    menu::{Menu, MenuItem},
    Manager,
};

fn setup_tray(app: &mut App) -> Result<(), Box<dyn Error>> {
    let menu = Menu::with_items(app, &[
        &MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?,
        &MenuItem::with_id(app, "open", "Open Window", true, None::<&str>)?,
        &PredefinedMenuItem::separator(app)?,
        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
    ])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { button: MouseButton::Left, .. } = event {
                // Toggle window visibility
            }
        })
        .build(app)?;

    Ok(())
}
```

## Frontend Architecture

### HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PortWatcher</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>PortWatcher</h1>
        <button id="refresh-btn">Refresh</button>
    </header>

    <main>
        <table id="port-table">
            <thead>
                <tr>
                    <th>Process</th>
                    <th>PID</th>
                    <th>Port</th>
                    <th>Protocol</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="port-list">
                <!-- Populated by JS -->
            </tbody>
        </table>
    </main>

    <footer>
        <span id="status">Ready</span>
        <span id="last-refresh"></span>
    </footer>

    <script type="module" src="main.js"></script>
</body>
</html>
```

### JavaScript Logic (`main.js`)

```javascript
import { invoke } from '@tauri-apps/api/core';

const portList = document.getElementById('port-list');
const refreshBtn = document.getElementById('refresh-btn');
const status = document.getElementById('status');

async function loadPorts() {
    status.textContent = 'Loading...';
    try {
        const ports = await invoke('get_ports');
        renderPorts(ports);
        status.textContent = `${ports.length} ports`;
    } catch (err) {
        status.textContent = `Error: ${err}`;
    }
}

function renderPorts(ports) {
    portList.innerHTML = ports.map(p => `
        <tr>
            <td>${escapeHtml(p.process_name)}</td>
            <td>${p.pid}</td>
            <td>${p.port}</td>
            <td>${p.protocol}</td>
            <td><button onclick="killProcess(${p.pid})">Kill</button></td>
        </tr>
    `).join('');
}

async function killProcess(pid) {
    if (!confirm(`Kill process ${pid}?`)) return;

    let result = await invoke('kill_process', { pid });

    if (result === 'PermissionDenied' || result === 'ElevationRequired') {
        if (confirm('Requires elevated privileges. Use pkexec?')) {
            result = await invoke('kill_process_elevated', { pid });
        }
    }

    if (result === 'Success') {
        loadPorts(); // Refresh list
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize
refreshBtn.addEventListener('click', loadPorts);
loadPorts();
```

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| PID Injection | Validate PID is numeric, exists in /proc |
| XSS | `escapeHtml()` for all process names |
| Privilege Escalation | pkexec only for non-owned processes |
| Arbitrary Execution | No shell commands, only `kill` syscall |

## Dependencies

### Cargo.toml

```toml
[package]
name = "portwatcher"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
procfs = "0.17"
nix = { version = "0.29", features = ["signal", "process", "user"] }
users = "0.11"

[build-dependencies]
tauri-build = { version = "2", features = [] }
```

## SOLID Compliance

| Principle | Implementation | Status |
|-----------|----------------|--------|
| **SRP** | Each module has single responsibility | ✅ |
| **OCP** | Platform abstraction via traits (future) | ✅ |
| **LSP** | N/A for MVP | ✅ |
| **ISP** | Minimal Tauri command interface | ✅ |
| **DIP** | Commands depend on module functions | ✅ |

## Testing Strategy

| Layer | Test Type | Coverage Target |
|-------|-----------|-----------------|
| `port_scanner` | Unit tests with mock /proc data | 80% |
| `process_resolver` | Unit tests with mock /proc data | 80% |
| `process_manager` | Integration tests (kill test processes) | 70% |
| `commands` | Integration tests via Tauri test utils | 60% |
| Frontend | Manual testing | - |

## Future Cross-Platform Support

```rust
// Abstract behind trait for future platforms
pub trait PortScanner {
    fn scan_all(&self) -> Result<Vec<PortInfo>, ScanError>;
}

// Linux implementation
pub struct LinuxPortScanner;
impl PortScanner for LinuxPortScanner { ... }

// Future: Windows implementation
// pub struct WindowsPortScanner;
// impl PortScanner for WindowsPortScanner { ... }
```

---

**Created**: 2024-12-16
**Status**: Approved
**Next**: `/x:implement`
