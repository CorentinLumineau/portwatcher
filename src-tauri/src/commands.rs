use crate::port_scanner::PortScanner;
use crate::presets::get_builtin_presets;
use crate::process_manager::ProcessManager;
use crate::process_resolver::ProcessResolver;
use crate::types::{KillResult, PortInfo, PortPreset, Protocol, TrayStats};
use std::collections::HashSet;

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

/// Scan a specific port range
#[tauri::command]
pub fn scan_port_range(start: u16, end: u16) -> Result<Vec<PortInfo>, String> {
    // Scan for sockets in the specified range
    let raw_entries = PortScanner::scan_range(start, end).map_err(|e| e.to_string())?;

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

/// Get built-in port presets
#[tauri::command]
pub fn get_presets() -> Vec<PortPreset> {
    get_builtin_presets()
}

/// Get statistics for the system tray tooltip
#[tauri::command]
pub fn get_tray_stats() -> Result<TrayStats, String> {
    let ports = get_ports()?;

    let tcp_count = ports.iter().filter(|p| p.protocol == Protocol::Tcp).count();
    let udp_count = ports.iter().filter(|p| p.protocol == Protocol::Udp).count();

    // Count unique PIDs
    let unique_pids: HashSet<u32> = ports.iter().map(|p| p.pid).collect();

    Ok(TrayStats {
        total_ports: ports.len(),
        tcp_count,
        udp_count,
        process_count: unique_pids.len(),
    })
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
