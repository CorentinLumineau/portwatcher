# PortWatcher - Requirements

## Overview

**Problem**: Developers frequently need to identify which processes are using specific ports and kill them (e.g., stuck dev servers, conflicting services). Current solutions require terminal commands (`lsof`, `netstat`, `kill`).

**Solution**: A lightweight system tray application that displays all listening ports with their processes and allows one-click termination.

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Tauri v2 | Lightweight, cross-platform ready, native system tray |
| Backend | Rust | Performance, system-level access, safety |
| Frontend | HTML/CSS/JS | Simple, fast for this use case |
| Target | Linux (Ubuntu) | Primary, with future Windows/macOS support |

## User Stories

1. **As a developer**, I want to see all processes listening on ports so I can identify what's running
2. **As a developer**, I want to kill a process directly from the list so I don't need terminal commands
3. **As a user**, I want a system tray icon so the app is always accessible without cluttering my desktop

## Core Requirements (MVP)

### R1: System Tray Integration
- App runs as system tray icon in Ubuntu header bar
- Uses AppIndicator3 for GNOME Shell compatibility
- Icon indicates app is running (static icon sufficient for MVP)

### R2: Tray Interactions
- **Left-click**: Opens popup/dropdown showing port list
- **Right-click**: Context menu with:
  - "Open Window" - opens detached window
  - "Refresh" - updates port list
  - "Quit" - exits application

### R3: Port List Display
| Column | Description |
|--------|-------------|
| Process | Application name (e.g., "node", "python3") |
| PID | Process ID |
| Port | Port number |
| Protocol | TCP/UDP |
| Action | Kill button |

### R4: Kill Process
- Click "Kill" button terminates the process
- Confirmation dialog before kill (optional, can be toggled)
- Handle permission errors gracefully (show message if elevated privileges needed)

### R5: Data Refresh
- Manual refresh button/menu option
- Auto-refresh every 5 seconds when popup is open

## Technical Implementation

### Port Detection (Linux)
```
1. Parse /proc/net/tcp and /proc/net/udp for listening sockets
2. Extract inode from socket entries
3. Map inode to PID by scanning /proc/[pid]/fd/ symlinks
4. Get process name from /proc/[pid]/comm
```

### Dependencies (Rust)
- `tauri` v2 - Application framework
- `sysinfo` - Process information
- `procfs` - Linux /proc filesystem parsing

## Success Criteria

- [ ] System tray icon appears on Ubuntu 22.04+
- [ ] Left-click shows list of listening ports
- [ ] Right-click shows context menu
- [ ] Kill button terminates selected process
- [ ] App uses < 50MB RAM when idle
- [ ] Refresh updates list within 1 second

## Pareto Analysis

### MVP (80% Value)
- System tray icon
- Port list popup
- Kill action
- Manual refresh

### Future Enhancements (20% Value)
- Search/filter ports
- Favorites/pinned ports
- Desktop notifications
- Windows/macOS support
- Auto-start on login
- Dark/light theme toggle

## Out of Scope (v1)
- Port history/logging
- Network traffic monitoring
- Remote machine support
- Custom port management (opening/closing)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    PortWatcher                       │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────────────────┐ │
│  │ System Tray │◄──►│      Tauri Backend          │ │
│  │   (Icon)    │    │  ┌─────────────────────┐    │ │
│  └──────┬──────┘    │  │   Port Scanner      │    │ │
│         │           │  │  (/proc/net/tcp)    │    │ │
│         ▼           │  └─────────────────────┘    │ │
│  ┌─────────────┐    │  ┌─────────────────────┐    │ │
│  │   Popup     │    │  │  Process Manager    │    │ │
│  │  (WebView)  │◄──►│  │  (kill, info)       │    │ │
│  │             │    │  └─────────────────────┘    │ │
│  │ ┌─────────┐ │    └─────────────────────────────┘ │
│  │ │App|Port│ │ │                                    │
│  │ │───|────│ │ │                                    │
│  │ │node|3000│ │                                     │
│  │ │pg |5432│ │ │                                    │
│  │ └─────────┘ │                                    │
│  └─────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

## Next Steps

1. `/x:design` - Create technical architecture
2. `/x:implement` - Build MVP

---

**Created**: 2024-12-16
**Status**: Draft
