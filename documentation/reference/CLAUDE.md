# Reference Documentation

Stack documentation, API references, and external resources.

## Contents

- [Reference Guide](./README.md) - Tech stack and API documentation

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Tauri v2 |
| Backend | Rust 1.75+ |
| Frontend | Vanilla JS |
| Target | Linux (Ubuntu 22.04+) |

## Key APIs

```typescript
// Tauri Commands
invoke('get_ports'): Promise<PortInfo[]>
invoke('kill_process', { pid }): Promise<KillResult>
invoke('kill_process_elevated', { pid }): Promise<KillResult>
```

## External Links

- [Tauri v2 Docs](https://v2.tauri.app/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Linux /proc filesystem](https://man7.org/linux/man-pages/man5/proc.5.html)
