// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashSet;
use std::sync::Arc;
use std::time::Duration;

use tauri::{
    menu::{IsMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

use portwatcher_lib::port_scanner::PortScanner;
use portwatcher_lib::presets::get_builtin_presets;
use portwatcher_lib::process_manager::ProcessManager;
use portwatcher_lib::process_resolver::ProcessResolver;
use portwatcher_lib::types::{KillResult, PortInfo, PortPreset, Protocol, TrayStats};

/// Get all listening ports with their process information
#[tauri::command]
fn get_ports() -> Result<Vec<PortInfo>, String> {
    let raw_entries = PortScanner::scan_all().map_err(|e| e.to_string())?;
    let resolver = ProcessResolver::new();

    let mut ports: Vec<PortInfo> = raw_entries
        .into_iter()
        .filter_map(|entry| {
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

    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

/// Kill a process by PID
#[tauri::command]
fn kill_process(pid: u32) -> KillResult {
    ProcessManager::kill(pid)
}

/// Kill a process by PID using elevated privileges (pkexec)
#[tauri::command]
fn kill_process_elevated(pid: u32) -> KillResult {
    ProcessManager::kill_elevated(pid)
}

/// Scan a specific port range
#[tauri::command]
fn scan_port_range(start: u16, end: u16) -> Result<Vec<PortInfo>, String> {
    let raw_entries = PortScanner::scan_range(start, end).map_err(|e| e.to_string())?;
    let resolver = ProcessResolver::new();

    let mut ports: Vec<PortInfo> = raw_entries
        .into_iter()
        .filter_map(|entry| {
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

    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

/// Get built-in port presets
#[tauri::command]
fn get_presets() -> Vec<PortPreset> {
    get_builtin_presets()
}

/// Get statistics for the system tray tooltip
#[tauri::command]
fn get_tray_stats() -> Result<TrayStats, String> {
    let ports = get_ports()?;

    let tcp_count = ports.iter().filter(|p| p.protocol == Protocol::Tcp).count();
    let udp_count = ports.iter().filter(|p| p.protocol == Protocol::Udp).count();

    let unique_pids: HashSet<u32> = ports.iter().map(|p| p.pid).collect();

    Ok(TrayStats {
        total_ports: ports.len(),
        tcp_count,
        udp_count,
        process_count: unique_pids.len(),
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_ports,
            kill_process,
            kill_process_elevated,
            scan_port_range,
            get_presets,
            get_tray_stats
        ])
        .setup(|app| {
            // Create tray menu items
            let refresh_item = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
            let open_item = MenuItem::with_id(app, "open", "Open Window", true, None::<&str>)?;
            let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;

            // Create Quick Scan submenu with presets
            let presets = get_builtin_presets();
            let preset_items: Vec<MenuItem<_>> = presets
                .iter()
                .map(|p| {
                    MenuItem::with_id(app, &format!("preset_{}", p.id), &p.name, true, None::<&str>)
                        .unwrap()
                })
                .collect();

            let preset_refs: Vec<&dyn IsMenuItem<_>> = preset_items
                .iter()
                .map(|item| item as &dyn IsMenuItem<_>)
                .collect();
            let quick_scan_submenu = Submenu::with_items(app, "Quick Scan", true, &preset_refs)?;

            let separator1 = PredefinedMenuItem::separator(app)?;
            let separator2 = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[
                    &refresh_item,
                    &quick_scan_submenu,
                    &separator1,
                    &open_item,
                    &settings_item,
                    &separator2,
                    &quit_item,
                ],
            )?;

            // Get initial stats for tooltip
            let initial_tooltip = match get_tray_stats() {
                Ok(stats) => format!(
                    "PortWatcher\n{} ports ({} TCP, {} UDP)",
                    stats.total_ports, stats.tcp_count, stats.udp_count
                ),
                Err(_) => "PortWatcher".to_string(),
            };

            // Build tray icon
            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip(&initial_tooltip)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    // Handle left-click: toggle window visibility
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .on_menu_event(|app, event| {
                    let id = event.id.as_ref();
                    match id {
                        "quit" => {
                            app.exit(0);
                        }
                        "open" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "refresh" => {
                            // Emit refresh event to frontend
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.emit("refresh-ports", ());
                            }
                        }
                        "settings" => {
                            // Emit settings event to frontend
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.emit("open-settings", ());
                            }
                        }
                        _ if id.starts_with("preset_") => {
                            // Extract preset ID and emit scan event
                            let preset_id = id.strip_prefix("preset_").unwrap_or("");
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.emit(
                                    "scan-preset",
                                    serde_json::json!({ "preset_id": preset_id }),
                                );
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Store tray handle for tooltip updates
            let tray_handle = Arc::new(tray);
            app.manage(tray_handle.clone());

            // Start background thread to update tray tooltip periodically
            let tray_for_thread = tray_handle.clone();
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(10));
                if let Ok(stats) = get_tray_stats() {
                    let tooltip = format!(
                        "PortWatcher\n{} ports ({} TCP, {} UDP)",
                        stats.total_ports, stats.tcp_count, stats.udp_count
                    );
                    let _ = tray_for_thread.set_tooltip(Some(&tooltip));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
