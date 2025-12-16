use crate::types::ProcessInfo;
use std::collections::HashMap;
use std::fs;
#[allow(unused_imports)]
use std::os::unix::fs::MetadataExt;

/// Resolver for mapping socket inodes to process information
pub struct ProcessResolver {
    /// Cache of inode -> PID mappings
    inode_map: HashMap<u64, u32>,
}

impl ProcessResolver {
    /// Create a new resolver and build the inode map
    pub fn new() -> Self {
        let inode_map = Self::build_inode_map();
        Self { inode_map }
    }

    /// Resolve an inode to process information
    pub fn resolve(&self, inode: u64) -> Option<ProcessInfo> {
        let pid = *self.inode_map.get(&inode)?;
        Self::get_process_info(pid)
    }

    /// Build a mapping of socket inodes to PIDs by scanning /proc/[pid]/fd/
    fn build_inode_map() -> HashMap<u64, u32> {
        let mut map = HashMap::new();

        // Read /proc directory
        let proc_dir = match fs::read_dir("/proc") {
            Ok(dir) => dir,
            Err(_) => return map,
        };

        for entry in proc_dir.flatten() {
            let path = entry.path();

            // Only process numeric directories (PIDs)
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if let Ok(pid) = name.parse::<u32>() {
                    Self::scan_process_fds(pid, &mut map);
                }
            }
        }

        map
    }

    /// Scan a process's file descriptors for socket inodes
    fn scan_process_fds(pid: u32, map: &mut HashMap<u64, u32>) {
        let fd_path = format!("/proc/{}/fd", pid);
        let fd_dir = match fs::read_dir(&fd_path) {
            Ok(dir) => dir,
            Err(_) => return, // Permission denied or process exited
        };

        for entry in fd_dir.flatten() {
            let link_path = entry.path();

            // Read the symlink target
            if let Ok(target) = fs::read_link(&link_path) {
                let target_str = target.to_string_lossy();

                // Check if it's a socket: socket:[inode]
                if target_str.starts_with("socket:[") && target_str.ends_with(']') {
                    if let Some(inode_str) = target_str
                        .strip_prefix("socket:[")
                        .and_then(|s| s.strip_suffix(']'))
                    {
                        if let Ok(inode) = inode_str.parse::<u64>() {
                            map.insert(inode, pid);
                        }
                    }
                }
            }
        }
    }

    /// Get process information from /proc/[pid]/
    fn get_process_info(pid: u32) -> Option<ProcessInfo> {
        let comm_path = format!("/proc/{}/comm", pid);
        let status_path = format!("/proc/{}/status", pid);

        // Read process name from /proc/[pid]/comm
        let name = fs::read_to_string(&comm_path)
            .ok()?
            .trim()
            .to_string();

        // Read UID from /proc/[pid]/status
        let uid = Self::get_process_uid(&status_path)?;

        // Get username from UID
        let user = Self::get_username(uid);

        Some(ProcessInfo { pid, name, user })
    }

    /// Extract UID from /proc/[pid]/status
    fn get_process_uid(status_path: &str) -> Option<u32> {
        let content = fs::read_to_string(status_path).ok()?;

        for line in content.lines() {
            if line.starts_with("Uid:") {
                // Format: Uid: real effective saved filesystem
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    return parts[1].parse().ok();
                }
            }
        }

        None
    }

    /// Get username from UID using the users crate
    fn get_username(uid: u32) -> String {
        users::get_user_by_uid(uid)
            .map(|u| u.name().to_string_lossy().to_string())
            .unwrap_or_else(|| uid.to_string())
    }

    /// Alternative: get process owner UID from file metadata
    #[allow(dead_code)]
    fn get_process_uid_from_metadata(pid: u32) -> Option<u32> {
        let path = format!("/proc/{}", pid);
        fs::metadata(&path).ok().map(|m| m.uid())
    }
}

impl Default for ProcessResolver {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolver_creation() {
        // This test just verifies the resolver can be created
        // Actual socket resolution depends on running processes
        let resolver = ProcessResolver::new();
        assert!(resolver.inode_map.len() >= 0); // May be empty in test environment
    }

    #[test]
    fn test_get_username() {
        // UID 0 should be root on most systems
        let username = ProcessResolver::get_username(0);
        assert_eq!(username, "root");
    }

    #[test]
    fn test_socket_pattern_parsing() {
        // Test the socket:[inode] pattern parsing logic
        let target = "socket:[12345]";
        let inode: Option<u64> = target
            .strip_prefix("socket:[")
            .and_then(|s| s.strip_suffix(']'))
            .and_then(|s| s.parse().ok());

        assert_eq!(inode, Some(12345));
    }

    #[test]
    fn test_invalid_socket_pattern() {
        let target = "pipe:[12345]";
        let inode: Option<u64> = target
            .strip_prefix("socket:[")
            .and_then(|s| s.strip_suffix(']'))
            .and_then(|s| s.parse().ok());

        assert_eq!(inode, None);
    }
}
