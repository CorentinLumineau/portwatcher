use crate::types::{PortPreset, PortRange};

/// Returns the built-in port scanning presets
pub fn get_builtin_presets() -> Vec<PortPreset> {
    vec![
        PortPreset {
            id: "web".to_string(),
            name: "Web Services".to_string(),
            description: Some("Common web server ports (HTTP, HTTPS, proxies)".to_string()),
            ranges: vec![],
            ports: vec![80, 443, 8080, 8443, 3000, 3001, 4000, 5000, 5173, 8000, 8888, 9000],
        },
        PortPreset {
            id: "database".to_string(),
            name: "Databases".to_string(),
            description: Some("Common database server ports".to_string()),
            ranges: vec![],
            ports: vec![
                3306,  // MySQL
                5432,  // PostgreSQL
                27017, // MongoDB
                6379,  // Redis
                9200,  // Elasticsearch
                5984,  // CouchDB
                8529,  // ArangoDB
                7474,  // Neo4j
                1433,  // SQL Server
                1521,  // Oracle
            ],
        },
        PortPreset {
            id: "dev".to_string(),
            name: "Development".to_string(),
            description: Some("Common development server ports".to_string()),
            ranges: vec![
                PortRange { start: 3000, end: 3010 },
                PortRange { start: 4000, end: 4010 },
                PortRange { start: 5000, end: 5010 },
                PortRange { start: 8000, end: 8010 },
            ],
            ports: vec![1420, 5173, 5174, 24678], // Tauri, Vite, Vite HMR
        },
        PortPreset {
            id: "system".to_string(),
            name: "System Services".to_string(),
            description: Some("Well-known system service ports (1-1024)".to_string()),
            ranges: vec![PortRange { start: 1, end: 1024 }],
            ports: vec![],
        },
        PortPreset {
            id: "high".to_string(),
            name: "High Ports".to_string(),
            description: Some("User-space ports (1024-65535)".to_string()),
            ranges: vec![PortRange { start: 1024, end: 65535 }],
            ports: vec![],
        },
        PortPreset {
            id: "messaging".to_string(),
            name: "Messaging & Queues".to_string(),
            description: Some("Message brokers and queue systems".to_string()),
            ranges: vec![],
            ports: vec![
                5672,  // RabbitMQ AMQP
                15672, // RabbitMQ Management
                9092,  // Kafka
                2181,  // ZooKeeper
                4222,  // NATS
                6650,  // Pulsar
                61613, // ActiveMQ STOMP
                61616, // ActiveMQ OpenWire
            ],
        },
        PortPreset {
            id: "container".to_string(),
            name: "Containers & Orchestration".to_string(),
            description: Some("Docker, Kubernetes, and container tools".to_string()),
            ranges: vec![],
            ports: vec![
                2375,  // Docker daemon (unencrypted)
                2376,  // Docker daemon (TLS)
                6443,  // Kubernetes API
                10250, // Kubelet
                10251, // Kube-scheduler
                10252, // Kube-controller-manager
                2379,  // etcd client
                2380,  // etcd peer
                8001,  // kubectl proxy
            ],
        },
        PortPreset {
            id: "network".to_string(),
            name: "Network Services".to_string(),
            description: Some("DNS, SSH, and network management".to_string()),
            ranges: vec![],
            ports: vec![
                22,   // SSH
                53,   // DNS
                67,   // DHCP server
                68,   // DHCP client
                123,  // NTP
                161,  // SNMP
                162,  // SNMP Trap
                389,  // LDAP
                636,  // LDAPS
                1194, // OpenVPN
            ],
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builtin_presets_not_empty() {
        let presets = get_builtin_presets();
        assert!(!presets.is_empty());
    }

    #[test]
    fn test_preset_ids_unique() {
        let presets = get_builtin_presets();
        let mut ids: Vec<_> = presets.iter().map(|p| &p.id).collect();
        let original_len = ids.len();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), original_len, "Preset IDs must be unique");
    }

    #[test]
    fn test_web_preset() {
        let presets = get_builtin_presets();
        let web = presets.iter().find(|p| p.id == "web").unwrap();
        assert!(web.ports.contains(&80));
        assert!(web.ports.contains(&443));
        assert!(web.ports.contains(&8080));
    }

    #[test]
    fn test_dev_preset_has_ranges() {
        let presets = get_builtin_presets();
        let dev = presets.iter().find(|p| p.id == "dev").unwrap();
        assert!(!dev.ranges.is_empty());
        assert!(dev.ranges.iter().any(|r| r.start == 3000 && r.end == 3010));
    }
}
