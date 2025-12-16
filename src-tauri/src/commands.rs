use crate::port_scanner::PortScanner;
use crate::process_manager::ProcessManager;
use crate::process_resolver::ProcessResolver;
use crate::types::{KillResult, PortInfo};

/// Get all listening ports with their process information
#[tauri::command]
pub fn get_ports() -> Result<Vec<PortInfo>, String> {
    // Scan for all listening sockets
    let raw_entries = PortScanner::scan_all().map_err(|e| e.to_string())?;

    // Build process resolver (scans /proc for inode mappings)
    let resolver = ProcessResolver::new();

    // Combine socket entries with process information
    let mut ports: Vec<PortInfo> = raw_entries
        .into_iter()
        .filter_map(|entry| {
            // Try to resolve the process for this socket
            let process_info = resolver.resolve(entry.inode)?;

            Some(PortInfo {
                pid: process_info.pid,
                process_name: process_info.name,
                port: entry.local_port,
                protocol: entry.protocol,
                address: entry.local_address,
                user: process_info.user,
            })
        })
        .collect();

    // Sort by port number for consistent display
    ports.sort_by_key(|p| p.port);

    Ok(ports)
}

/// Kill a process by PID
#[tauri::command]
pub fn kill_process(pid: u32) -> KillResult {
    ProcessManager::kill(pid)
}

/// Kill a process by PID using elevated privileges (pkexec)
#[tauri::command]
pub fn kill_process_elevated(pid: u32) -> KillResult {
    ProcessManager::kill_elevated(pid)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_ports_returns_list() {
        // This test verifies get_ports doesn't panic
        // Actual ports depend on system state
        let result = get_ports();
        assert!(result.is_ok());
    }

    #[test]
    fn test_kill_process_invalid() {
        let result = kill_process(999999999);
        matches!(result, KillResult::ProcessNotFound { .. });
    }
}
