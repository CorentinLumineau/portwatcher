use serde::{Deserialize, Serialize};

/// Information about a process listening on a network port
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    /// Process ID
    pub pid: u32,
    /// Name of the process (e.g., "node", "python3")
    pub process_name: String,
    /// Port number
    pub port: u16,
    /// Protocol (TCP or UDP)
    pub protocol: Protocol,
    /// Local address (e.g., "0.0.0.0", "127.0.0.1")
    pub address: String,
    /// Username of process owner
    pub user: String,
}

/// Network protocol type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Protocol {
    Tcp,
    Udp,
}

impl std::fmt::Display for Protocol {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Protocol::Tcp => write!(f, "TCP"),
            Protocol::Udp => write!(f, "UDP"),
        }
    }
}

/// Result of a kill process operation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status")]
pub enum KillResult {
    /// Process was successfully terminated
    Success,
    /// Permission denied - process owned by another user
    PermissionDenied { pid: u32 },
    /// Elevation required - need root privileges
    ElevationRequired { pid: u32 },
    /// Process not found (may have already exited)
    ProcessNotFound { pid: u32 },
    /// Other error occurred
    Error { message: String },
}

/// Raw socket entry parsed from /proc/net/tcp or /proc/net/udp
#[derive(Debug, Clone)]
pub struct RawSocketEntry {
    /// Local IP address in dotted notation
    pub local_address: String,
    /// Local port number
    pub local_port: u16,
    /// Socket inode number (used to map to process)
    pub inode: u64,
    /// Protocol type
    pub protocol: Protocol,
}

/// Error type for port scanning operations
#[derive(Debug, thiserror::Error)]
pub enum ScanError {
    #[error("Failed to read {path}: {source}")]
    IoError {
        path: String,
        #[source]
        source: std::io::Error,
    },
    #[error("Failed to parse line: {0}")]
    ParseError(String),
}

/// Process information resolved from inode
#[derive(Debug, Clone)]
pub struct ProcessInfo {
    /// Process ID
    pub pid: u32,
    /// Process name from /proc/[pid]/comm
    pub name: String,
    /// Username of process owner
    pub user: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protocol_display() {
        assert_eq!(Protocol::Tcp.to_string(), "TCP");
        assert_eq!(Protocol::Udp.to_string(), "UDP");
    }

    #[test]
    fn test_port_info_serialization() {
        let info = PortInfo {
            pid: 1234,
            process_name: "test".to_string(),
            port: 8080,
            protocol: Protocol::Tcp,
            address: "127.0.0.1".to_string(),
            user: "testuser".to_string(),
        };
        let json = serde_json::to_string(&info).unwrap();
        assert!(json.contains("\"pid\":1234"));
        assert!(json.contains("\"protocol\":\"Tcp\""));
    }

    #[test]
    fn test_kill_result_serialization() {
        let result = KillResult::PermissionDenied { pid: 1234 };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"status\":\"PermissionDenied\""));
        assert!(json.contains("\"pid\":1234"));
    }
}
