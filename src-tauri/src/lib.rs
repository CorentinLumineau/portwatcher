pub mod commands;
pub mod port_scanner;
pub mod presets;
pub mod process_manager;
pub mod process_resolver;
pub mod types;

// Re-export commands for easy access in main.rs
pub use commands::{
    get_ports, get_presets, get_tray_stats, kill_process, kill_process_elevated, scan_port_range,
};
