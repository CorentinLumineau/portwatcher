---
milestone: 4
title: System Tray & Window
effort: 1 day
roi: Medium-High
status: pending
---

# Milestone 4: System Tray & Window

## Objective

Implement the Tauri application entry point with system tray icon, left-click window toggle, and right-click context menu. This is the **production-ready checkpoint**.

## Why Fourth (Pareto Justification)

- **Production-ready milestone**: After this, app is functional
- **Core UX**: Tray is the primary interaction point
- **Backend testable**: Can verify all commands work

## Deliverables

| File | Description |
|------|-------------|
| `src-tauri/src/main.rs` | Tauri app setup, tray configuration |
| `src/index.html` | Minimal placeholder for window |

## Tasks

### Task 4.1: Implement Main with System Tray

```bash
/x:implement "Create src-tauri/src/main.rs: Tauri app with system tray using TrayIconBuilder. Left-click event toggles main window visibility (show/hide). Right-click menu with MenuBuilder: 'Refresh' item (emits refresh event), 'Open Window' (shows and focuses window), separator, 'Quit' (exits app). Register commands with invoke_handler(tauri::generate_handler![get_ports, kill_process, kill_process_elevated]). Window starts hidden. Use tauri::tray module for Tauri v2 API."
```

**Acceptance Criteria**:
- [ ] App starts with tray icon visible
- [ ] Left-click toggles window
- [ ] Right-click shows menu
- [ ] Quit exits cleanly
- [ ] Commands registered

### Task 4.2: Create Minimal Frontend Placeholder

```bash
/x:implement "Create src/index.html with minimal HTML: doctype, head with title 'PortWatcher', body with h1 'PortWatcher' and p 'Loading...' and script tag importing main.js as module. This placeholder confirms window renders while full UI is built in M5."
```

**Acceptance Criteria**:
- [ ] Window displays placeholder content
- [ ] No JavaScript errors

## Technical Details

### Tauri v2 Tray API

```rust
use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton},
    menu::{Menu, MenuItem, PredefinedMenuItem},
    Manager,
};

// In setup
let menu = Menu::with_items(app, &[
    &MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?,
    &MenuItem::with_id(app, "open", "Open Window", true, None::<&str>)?,
    &PredefinedMenuItem::separator(app)?,
    &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
])?;

TrayIconBuilder::new()
    .menu(&menu)
    .on_tray_icon_event(|tray, event| {
        match event {
            TrayIconEvent::Click { button: MouseButton::Left, .. } => {
                // Toggle window
            }
            _ => {}
        }
    })
    .on_menu_event(|app, event| {
        match event.id.as_ref() {
            "quit" => app.exit(0),
            "open" => { /* show window */ }
            "refresh" => { /* emit event */ }
            _ => {}
        }
    })
    .build(app)?;
```

### Window Management

```rust
// Toggle visibility
if let Some(window) = app.get_webview_window("main") {
    if window.is_visible().unwrap_or(false) {
        window.hide().ok();
    } else {
        window.show().ok();
        window.set_focus().ok();
    }
}
```

## Success Criteria

- [ ] Tray icon appears in Ubuntu top bar
- [ ] Left-click shows/hides window
- [ ] Right-click menu functional
- [ ] Quit exits application
- [ ] `cargo tauri dev` runs successfully

## Production-Ready Checkpoint

After this milestone:
- Backend fully functional (get_ports, kill_process work)
- Tray interaction complete
- Can test via browser dev tools console
- **Ship-worthy for CLI/power users**

## Dependencies

- Milestone 1-3: All backend modules

## Next Milestone

After completion: [Milestone 5: Frontend UI & Polish](./milestone-5-frontend.md)
