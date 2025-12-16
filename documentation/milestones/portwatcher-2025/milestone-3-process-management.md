---
milestone: 3
title: Process Management & Commands
effort: 1.5 days
roi: High
status: pending
---

# Milestone 3: Process Management & Commands

## Objective

Implement process termination with privilege handling (pkexec for root processes) and create Tauri IPC command handlers that bridge frontend to backend.

## Why Third (Pareto Justification)

- **Enables kill action**: Core user interaction besides viewing
- **Completes backend**: After this, all business logic is done
- **Permission handling**: Critical UX for non-owned processes

## Deliverables

| File | Description |
|------|-------------|
| `src-tauri/src/process_manager.rs` | Kill with SIGTERM/SIGKILL, pkexec elevation |
| `src-tauri/src/commands.rs` | Tauri IPC handlers: get_ports, kill_process |
| `src-tauri/src/lib.rs` | Module exports |

## Tasks

### Task 3.1: Implement Process Manager

```bash
/x:implement "Create src-tauri/src/process_manager.rs: ProcessManager struct with kill(pid: u32) -> KillResult using nix::sys::signal::kill with SIGTERM, return Success or PermissionDenied. Implement kill_elevated(pid: u32) -> KillResult using std::process::Command to spawn 'pkexec kill -TERM {pid}', parse exit code. Add is_owned_by_current_user(pid: u32) -> bool comparing process UID to current user via users::get_current_uid()."
```

**Acceptance Criteria**:
- [ ] Can kill owned processes with SIGTERM
- [ ] Returns PermissionDenied for other users' processes
- [ ] kill_elevated spawns pkexec correctly
- [ ] Ownership check works

### Task 3.2: Implement Tauri Commands

```bash
/x:implement "Create src-tauri/src/commands.rs with #[tauri::command] functions: get_ports() -> Result<Vec<PortInfo>, String> that uses PortScanner::scan_all() and ProcessResolver to build complete PortInfo list. kill_process(pid: u32) -> KillResult using ProcessManager::kill(). kill_process_elevated(pid: u32) -> KillResult using ProcessManager::kill_elevated(). Handle errors gracefully."
```

**Acceptance Criteria**:
- [ ] get_ports returns valid PortInfo list
- [ ] kill_process works for owned processes
- [ ] kill_process_elevated invokes pkexec

### Task 3.3: Create Module Exports

```bash
/x:implement "Create src-tauri/src/lib.rs declaring modules: pub mod types; pub mod port_scanner; pub mod process_resolver; pub mod process_manager; pub mod commands; Re-export commands for main.rs: pub use commands::{get_ports, kill_process, kill_process_elevated};"
```

**Acceptance Criteria**:
- [ ] All modules accessible
- [ ] Commands exported for invoke_handler

## Technical Details

### Kill Signal Flow

```
kill_process(pid)
    │
    ├─► is_owned_by_current_user(pid)?
    │       │
    │       ├─► Yes: nix::sys::signal::kill(pid, SIGTERM)
    │       │       └─► Success or Error
    │       │
    │       └─► No: Return PermissionDenied
    │
kill_process_elevated(pid)
    │
    └─► Command::new("pkexec")
            .arg("kill")
            .arg("-TERM")
            .arg(pid.to_string())
            .status()
```

### pkexec Integration

pkexec will show a graphical password prompt. If the user cancels:
- Exit code 126 = authentication dismissed
- Exit code 127 = pkexec not found

## Success Criteria

- [ ] Can kill own processes via IPC
- [ ] Permission denied returned for other users
- [ ] pkexec prompt appears for elevated kill
- [ ] All commands work via Tauri invoke

## Dependencies

- Milestone 1: types.rs
- Milestone 2: port_scanner.rs, process_resolver.rs

## Next Milestone

After completion: [Milestone 4: System Tray & Window](./milestone-4-system-tray.md)
