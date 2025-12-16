---
milestone: 1
title: Foundation & Types
effort: 1 day
roi: Very High
status: pending
---

# Milestone 1: Foundation & Types

## Objective

Establish the Tauri v2 project structure with all dependencies and create shared data types that all other modules will depend on.

## Why First (Pareto Justification)

- **Blocking dependency**: Every other milestone requires this foundation
- **Zero value without it**: Cannot write any Rust code without project setup
- **Quick win**: 1 day to unlock all subsequent work

## Deliverables

| File | Description |
|------|-------------|
| `src-tauri/Cargo.toml` | Dependencies: tauri 2, serde, procfs, nix, users |
| `src-tauri/tauri.conf.json` | App config, tray-icon capability, window settings |
| `src-tauri/build.rs` | Tauri build script |
| `src-tauri/src/types.rs` | PortInfo, Protocol, KillResult, RawSocketEntry |

## Tasks

### Task 1.1: Initialize Tauri v2 Project

```bash
/x:implement "Initialize Tauri v2 project: Create src-tauri/ with Cargo.toml (tauri 2 with tray-icon feature, serde, serde_json, procfs 0.17, nix 0.29 with signal/process/user features, users 0.11), tauri.conf.json (identifier: com.portwatcher.app, window 400x500 hidden on start, tray-icon capability), and build.rs"
```

**Acceptance Criteria**:
- [ ] `cargo check` passes in src-tauri/
- [ ] All dependencies resolve

### Task 1.2: Create Shared Types

```bash
/x:implement "Create src-tauri/src/types.rs with: PortInfo struct (pid: u32, process_name: String, port: u16, protocol: Protocol, address: String, user: String), Protocol enum (Tcp, Udp), KillResult enum (Success, PermissionDenied{pid}, ElevationRequired{pid}, ProcessNotFound{pid}, Error{message}), RawSocketEntry struct (local_address, local_port, inode, protocol). All with Serialize, Deserialize, Debug, Clone derives"
```

**Acceptance Criteria**:
- [ ] All types compile
- [ ] Serde serialization works

## Success Criteria

- [ ] Project compiles with `cargo check`
- [ ] types.rs exports all required types
- [ ] Ready for port_scanner.rs implementation

## Dependencies

None - this is the foundation.

## Next Milestone

After completion: [Milestone 2: Port Scanning Engine](./milestone-2-port-scanning.md)
