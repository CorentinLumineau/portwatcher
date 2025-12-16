use crate::types::KillResult;
use nix::sys::signal::{kill, Signal};
use nix::unistd::Pid;
use std::fs;
use std::process::Command;

/// Manager for process termination operations
pub struct ProcessManager;

impl ProcessManager {
    /// Kill a process by PID using SIGTERM
    ///
    /// Returns Success if the process was killed, PermissionDenied if the caller
    /// doesn't have permission, or an error for other failures.
    pub fn kill(pid: u32) -> KillResult {
        // First check if the process exists
        if !Self::process_exists(pid) {
            return KillResult::ProcessNotFound { pid };
        }

        // Check if we own the process
        if !Self::is_owned_by_current_user(pid) {
            return KillResult::PermissionDenied { pid };
        }

        // Try to kill with SIGTERM
        match kill(Pid::from_raw(pid as i32), Signal::SIGTERM) {
            Ok(()) => KillResult::Success,
            Err(nix::errno::Errno::EPERM) => KillResult::PermissionDenied { pid },
            Err(nix::errno::Errno::ESRCH) => KillResult::ProcessNotFound { pid },
            Err(e) => KillResult::Error {
                message: format!("Failed to kill process {}: {}", pid, e),
            },
        }
    }

    /// Kill a process using pkexec for elevated privileges
    ///
    /// This will prompt the user for their password via a graphical dialog.
    pub fn kill_elevated(pid: u32) -> KillResult {
        // First check if the process exists
        if !Self::process_exists(pid) {
            return KillResult::ProcessNotFound { pid };
        }

        // Use pkexec to run kill with elevated privileges
        let result = Command::new("pkexec")
            .arg("kill")
            .arg("-TERM")
            .arg(pid.to_string())
            .status();

        match result {
            Ok(status) => {
                if status.success() {
                    KillResult::Success
                } else {
                    match status.code() {
                        Some(126) => {
                            // Authentication dialog dismissed
                            KillResult::Error {
                                message: "Authentication cancelled".to_string(),
                            }
                        }
                        Some(127) => {
                            // pkexec not found
                            KillResult::Error {
                                message: "pkexec not found. Please install policykit-1".to_string(),
                            }
                        }
                        Some(1) => {
                            // Process may have exited
                            if Self::process_exists(pid) {
                                KillResult::Error {
                                    message: format!("Failed to kill process {}", pid),
                                }
                            } else {
                                // Process is gone, consider it a success
                                KillResult::Success
                            }
                        }
                        _ => KillResult::Error {
                            message: format!("pkexec exited with code: {:?}", status.code()),
                        },
                    }
                }
            }
            Err(e) => KillResult::Error {
                message: format!("Failed to execute pkexec: {}", e),
            },
        }
    }

    /// Check if a process is owned by the current user
    pub fn is_owned_by_current_user(pid: u32) -> bool {
        let status_path = format!("/proc/{}/status", pid);
        let content = match fs::read_to_string(&status_path) {
            Ok(c) => c,
            Err(_) => return false,
        };

        // Parse UID from status file
        for line in content.lines() {
            if line.starts_with("Uid:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(process_uid) = parts[1].parse::<u32>() {
                        let current_uid = users::get_current_uid();
                        return process_uid == current_uid;
                    }
                }
            }
        }

        false
    }

    /// Check if a process exists
    fn process_exists(pid: u32) -> bool {
        let proc_path = format!("/proc/{}", pid);
        std::path::Path::new(&proc_path).exists()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_exists_self() {
        // Our own process should exist
        let pid = std::process::id();
        assert!(ProcessManager::process_exists(pid));
    }

    #[test]
    fn test_process_exists_invalid() {
        // A very high PID should not exist
        assert!(!ProcessManager::process_exists(999999999));
    }

    #[test]
    fn test_is_owned_by_current_user_self() {
        // Our own process should be owned by current user
        let pid = std::process::id();
        assert!(ProcessManager::is_owned_by_current_user(pid));
    }

    #[test]
    fn test_is_owned_by_current_user_init() {
        // Process 1 (init/systemd) is typically owned by root
        // Unless we're running as root, this should return false
        if users::get_current_uid() != 0 {
            assert!(!ProcessManager::is_owned_by_current_user(1));
        }
    }

    #[test]
    fn test_kill_nonexistent() {
        let result = ProcessManager::kill(999999999);
        matches!(result, KillResult::ProcessNotFound { .. });
    }

    #[test]
    fn test_kill_not_owned() {
        // Process 1 is typically not owned by regular users
        if users::get_current_uid() != 0 {
            let result = ProcessManager::kill(1);
            matches!(result, KillResult::PermissionDenied { .. });
        }
    }
}
