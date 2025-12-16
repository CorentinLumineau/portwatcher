---
milestone: 2
title: Port Scanning Engine
effort: 2 days
roi: Very High
status: pending
---

# Milestone 2: Port Scanning Engine

## Objective

Implement the core port scanning functionality that reads `/proc/net/tcp` and `/proc/net/udp` and resolves socket inodes to process information.

## Why Second (Pareto Justification)

- **Core value delivery**: This IS the main feature - listing ports
- **Immediate utility**: After this milestone, can query ports programmatically
- **Foundation for UI**: All display features depend on this data

## Deliverables

| File | Description |
|------|-------------|
| `src-tauri/src/port_scanner.rs` | Parse /proc/net/tcp and /proc/net/udp |
| `src-tauri/src/process_resolver.rs` | Map inodes to PIDs and process names |
| Unit tests | Tests for parsing and resolution logic |

## Tasks

### Task 2.1: Implement Port Scanner

```bash
/x:implement "Create src-tauri/src/port_scanner.rs: PortScanner struct with scan_all() -> Result<Vec<RawSocketEntry>, ScanError> that combines TCP and UDP results. Private methods parse_tcp() and parse_udp() that read /proc/net/tcp and /proc/net/udp, skip header line, parse hex local_address:port, filter for LISTEN state (st=0A for TCP), extract inode. Handle hex-to-decimal conversion for addresses and ports."
```

**Acceptance Criteria**:
- [ ] Parses /proc/net/tcp correctly
- [ ] Parses /proc/net/udp correctly
- [ ] Returns port, address, inode for each socket

### Task 2.2: Implement Process Resolver

```bash
/x:implement "Create src-tauri/src/process_resolver.rs: ProcessResolver struct with resolve(inode: u64) -> Option<ProcessInfo>. Private build_inode_map() -> HashMap<u64, u32> that scans /proc/[pid]/fd/ symlinks for 'socket:[inode]' pattern. Private get_process_info(pid: u32) -> Option<ProcessInfo> that reads /proc/[pid]/comm for name and uses users crate to get username from UID in /proc/[pid]/status."
```

**Acceptance Criteria**:
- [ ] Maps inodes to PIDs correctly
- [ ] Extracts process name from /proc/[pid]/comm
- [ ] Gets username for process owner

### Task 2.3: Unit Tests

```bash
/x:implement "Add unit tests for port_scanner.rs and process_resolver.rs: Test parse_tcp_line() with sample /proc/net/tcp format '0: 0100007F:1F90 00000000:0000 0A ...', test hex_to_port() and hex_to_ip() conversions, test inode extraction from socket symlink 'socket:[12345]'. Create test module with #[cfg(test)]."
```

**Acceptance Criteria**:
- [ ] `cargo test` passes
- [ ] Line parsing tested
- [ ] Hex conversion tested

## Technical Details

### /proc/net/tcp Format

```
sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
0: 0100007F:1F90 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 12345
```

- Column 2: local_address (hex IP:port)
- Column 4: state (0A = LISTEN)
- Column 10: inode

### Socket Symlink Format

```
/proc/1234/fd/5 -> socket:[12345]
```

## Success Criteria

- [ ] Can list all listening TCP ports
- [ ] Can list all listening UDP ports
- [ ] Each port has process name, PID, user
- [ ] Unit tests pass

## Dependencies

- Milestone 1: types.rs must exist

## Next Milestone

After completion: [Milestone 3: Process Management](./milestone-3-process-management.md)
