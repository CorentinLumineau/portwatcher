// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

use portwatcher_lib::port_scanner::PortScanner;
use portwatcher_lib::process_manager::ProcessManager;
use portwatcher_lib::process_resolver::ProcessResolver;
use portwatcher_lib::types::{KillResult, PortInfo};

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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_ports,
            kill_process,
            kill_process_elevated
        ])
        .setup(|app| {
            // Create tray menu
            let refresh_item = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
            let open_item = MenuItem::with_id(app, "open", "Open Window", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&refresh_item, &open_item, &separator, &quit_item])?;

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
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
                    match event.id.as_ref() {
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
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
