# Reference Documentation

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Tauri | v2 |
| Backend | Rust | 1.75+ |
| Frontend | Vanilla JS | ES2022 |
| Target OS | Linux | Ubuntu 22.04+ |

## External Documentation

### Tauri v2
- [Official Docs](https://v2.tauri.app/)
- [API Reference](https://v2.tauri.app/reference/)
- [System Tray](https://v2.tauri.app/learn/system-tray/)
- [IPC Commands](https://v2.tauri.app/develop/calling-rust/)

### Rust
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [std Library](https://doc.rust-lang.org/std/)

### Key Crates

| Crate | Purpose | Docs |
|-------|---------|------|
| `tauri` | Application framework | [docs.rs/tauri](https://docs.rs/tauri) |
| `serde` | Serialization | [docs.rs/serde](https://docs.rs/serde) |
| `nix` | Unix system calls | [docs.rs/nix](https://docs.rs/nix) |
| `users` | User/group lookup | [docs.rs/users](https://docs.rs/users) |
| `thiserror` | Error handling | [docs.rs/thiserror](https://docs.rs/thiserror) |

## Linux APIs

### /proc Filesystem

**Port Information:**
- `/proc/net/tcp` - TCP socket information
- `/proc/net/udp` - UDP socket information

**Process Information:**
- `/proc/[pid]/comm` - Process name
- `/proc/[pid]/status` - Process status (includes UID)
- `/proc/[pid]/fd/` - File descriptors (socket symlinks)

### Signal Handling

| Signal | Value | Purpose |
|--------|-------|---------|
| SIGTERM | 15 | Graceful termination |
| SIGKILL | 9 | Force termination |

## API Reference

### Tauri Commands

```typescript
// Get all listening ports
invoke('get_ports'): Promise<PortInfo[]>

// Kill a process
invoke('kill_process', { pid: number }): Promise<KillResult>

// Kill with elevated privileges
invoke('kill_process_elevated', { pid: number }): Promise<KillResult>
```

### Data Types

```typescript
interface PortInfo {
  pid: number;
  process_name: string;
  port: number;
  protocol: 'Tcp' | 'Udp';
  address: string;
  user: string;
}

type KillResult =
  | { status: 'Success' }
  | { status: 'PermissionDenied', pid: number }
  | { status: 'ElevationRequired', pid: number }
  | { status: 'ProcessNotFound', pid: number }
  | { status: 'Error', message: string }
```

### Events

```typescript
// Listen for refresh event from tray menu
listen('refresh-ports', () => void)
```

## Context7 Libraries

For up-to-date documentation, use Context7 MCP:

```
/vercel/tauri - Tauri framework documentation
```

Run `/x:setup --refresh` to fetch latest documentation.
