use crate::types::{Protocol, RawSocketEntry, ScanError};
use std::fs;

/// Scanner for reading listening ports from /proc/net/
pub struct PortScanner;

impl PortScanner {
    /// Scan all listening TCP and UDP ports
    pub fn scan_all() -> Result<Vec<RawSocketEntry>, ScanError> {
        let mut entries = Vec::new();

        // Scan TCP ports
        entries.extend(Self::parse_tcp()?);

        // Scan UDP ports (UDP doesn't have LISTEN state, include all bound ports)
        entries.extend(Self::parse_udp()?);

        Ok(entries)
    }

    /// Parse /proc/net/tcp for listening TCP sockets
    fn parse_tcp() -> Result<Vec<RawSocketEntry>, ScanError> {
        let content = fs::read_to_string("/proc/net/tcp").map_err(|e| ScanError::IoError {
            path: "/proc/net/tcp".to_string(),
            source: e,
        })?;

        Self::parse_proc_net(&content, Protocol::Tcp, true)
    }

    /// Parse /proc/net/udp for UDP sockets
    fn parse_udp() -> Result<Vec<RawSocketEntry>, ScanError> {
        let content = fs::read_to_string("/proc/net/udp").map_err(|e| ScanError::IoError {
            path: "/proc/net/udp".to_string(),
            source: e,
        })?;

        // UDP doesn't have LISTEN state, so we don't filter by state
        Self::parse_proc_net(&content, Protocol::Udp, false)
    }

    /// Parse the content of a /proc/net/ file
    fn parse_proc_net(
        content: &str,
        protocol: Protocol,
        filter_listen: bool,
    ) -> Result<Vec<RawSocketEntry>, ScanError> {
        let mut entries = Vec::new();

        for line in content.lines().skip(1) {
            // Skip header line
            if let Some(entry) = Self::parse_line(line, protocol, filter_listen)? {
                entries.push(entry);
            }
        }

        Ok(entries)
    }

    /// Parse a single line from /proc/net/tcp or /proc/net/udp
    ///
    /// Format:
    /// sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
    /// 0: 0100007F:1F90 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 12345
    fn parse_line(
        line: &str,
        protocol: Protocol,
        filter_listen: bool,
    ) -> Result<Option<RawSocketEntry>, ScanError> {
        let parts: Vec<&str> = line.split_whitespace().collect();

        if parts.len() < 10 {
            return Ok(None); // Skip malformed lines
        }

        // Parse state (column 4, 0-indexed at 3)
        let state = parts[3];

        // For TCP, only include LISTEN state (0x0A = 10)
        // For UDP, include all bound sockets
        if filter_listen && state != "0A" {
            return Ok(None);
        }

        // Parse local address:port (column 2, 0-indexed at 1)
        let local_addr_port = parts[1];
        let (address, port) = Self::parse_address_port(local_addr_port)?;

        // Skip if port is 0 (not actually bound)
        if port == 0 {
            return Ok(None);
        }

        // Parse inode (column 10, 0-indexed at 9)
        let inode: u64 = parts[9].parse().map_err(|_| {
            ScanError::ParseError(format!("Invalid inode: {}", parts[9]))
        })?;

        // Skip if inode is 0 (socket not associated with a process)
        if inode == 0 {
            return Ok(None);
        }

        Ok(Some(RawSocketEntry {
            local_address: address,
            local_port: port,
            inode,
            protocol,
        }))
    }

    /// Parse hex address:port format (e.g., "0100007F:1F90")
    fn parse_address_port(addr_port: &str) -> Result<(String, u16), ScanError> {
        let parts: Vec<&str> = addr_port.split(':').collect();
        if parts.len() != 2 {
            return Err(ScanError::ParseError(format!(
                "Invalid address:port format: {}",
                addr_port
            )));
        }

        let address = Self::hex_to_ip(parts[0])?;
        let port = Self::hex_to_port(parts[1])?;

        Ok((address, port))
    }

    /// Convert hex IP address to dotted notation
    /// Note: /proc/net stores IP in little-endian format
    fn hex_to_ip(hex: &str) -> Result<String, ScanError> {
        if hex.len() != 8 {
            return Err(ScanError::ParseError(format!(
                "Invalid IP hex length: {}",
                hex
            )));
        }

        let bytes: Result<Vec<u8>, _> = (0..4)
            .map(|i| u8::from_str_radix(&hex[i * 2..i * 2 + 2], 16))
            .collect();

        let bytes = bytes.map_err(|_| ScanError::ParseError(format!("Invalid IP hex: {}", hex)))?;

        // Reverse for little-endian to big-endian conversion
        Ok(format!("{}.{}.{}.{}", bytes[3], bytes[2], bytes[1], bytes[0]))
    }

    /// Convert hex port to u16
    fn hex_to_port(hex: &str) -> Result<u16, ScanError> {
        u16::from_str_radix(hex, 16)
            .map_err(|_| ScanError::ParseError(format!("Invalid port hex: {}", hex)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_to_ip_localhost() {
        // 0100007F = 127.0.0.1 in little-endian
        let ip = PortScanner::hex_to_ip("0100007F").unwrap();
        assert_eq!(ip, "127.0.0.1");
    }

    #[test]
    fn test_hex_to_ip_any() {
        // 00000000 = 0.0.0.0
        let ip = PortScanner::hex_to_ip("00000000").unwrap();
        assert_eq!(ip, "0.0.0.0");
    }

    #[test]
    fn test_hex_to_port() {
        // 1F90 = 8080
        let port = PortScanner::hex_to_port("1F90").unwrap();
        assert_eq!(port, 8080);

        // 0050 = 80
        let port = PortScanner::hex_to_port("0050").unwrap();
        assert_eq!(port, 80);
    }

    #[test]
    fn test_parse_address_port() {
        let (addr, port) = PortScanner::parse_address_port("0100007F:1F90").unwrap();
        assert_eq!(addr, "127.0.0.1");
        assert_eq!(port, 8080);
    }

    #[test]
    fn test_parse_tcp_line_listen() {
        let line = "   0: 0100007F:1F90 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 12345 1 0000000000000000 100 0 0 10 0";
        let entry = PortScanner::parse_line(line, Protocol::Tcp, true)
            .unwrap()
            .unwrap();

        assert_eq!(entry.local_address, "127.0.0.1");
        assert_eq!(entry.local_port, 8080);
        assert_eq!(entry.inode, 12345);
        assert_eq!(entry.protocol, Protocol::Tcp);
    }

    #[test]
    fn test_parse_tcp_line_non_listen() {
        // State 01 = ESTABLISHED, should be filtered out
        let line = "   0: 0100007F:1F90 00000000:0000 01 00000000:00000000 00:00000000 00000000  1000        0 12345";
        let entry = PortScanner::parse_line(line, Protocol::Tcp, true).unwrap();
        assert!(entry.is_none());
    }

    #[test]
    fn test_parse_udp_line() {
        // UDP uses state 07 for bound sockets
        let line = "   0: 00000000:0035 00000000:0000 07 00000000:00000000 00:00000000 00000000     0        0 11111 1 0000000000000000 0";
        let entry = PortScanner::parse_line(line, Protocol::Udp, false)
            .unwrap()
            .unwrap();

        assert_eq!(entry.local_address, "0.0.0.0");
        assert_eq!(entry.local_port, 53); // DNS port
        assert_eq!(entry.inode, 11111);
        assert_eq!(entry.protocol, Protocol::Udp);
    }
}
