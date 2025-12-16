# Implementation Documentation

Technical architecture, design decisions, and implementation details.

## Contents

- [Architecture](./portwatcher-architecture.md) - Technical architecture and module design

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           PortWatcher                    │
├─────────────────────────────────────────┤
│  System Tray ◄──► Rust Backend          │
│      │            ├── port_scanner      │
│      ▼            ├── process_resolver  │
│  WebView UI ◄────►├── process_manager   │
│                   └── commands          │
└─────────────────────────────────────────┘
```

## Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `types.rs` | Shared data types (PortInfo, KillResult) |
| `port_scanner.rs` | Parse /proc/net/tcp and /proc/net/udp |
| `process_resolver.rs` | Map socket inodes to process info |
| `process_manager.rs` | Kill processes with privilege handling |
| `commands.rs` | Tauri IPC command handlers |
| `main.rs` | App entry point, system tray setup |
