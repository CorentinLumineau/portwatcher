---
milestone: 5
title: Frontend UI & Polish
effort: 1.5 days
roi: Medium
status: pending
---

# Milestone 5: Frontend UI & Polish

## Objective

Build the complete frontend UI with port table, kill buttons, styling, icons, and prepare for release. This is the **final polish** milestone.

## Why Last (Pareto Justification)

- **Visual layer**: Backend works without it
- **Polish phase**: Core functionality already complete
- **Release preparation**: Icons, testing, build

## Deliverables

| File | Description |
|------|-------------|
| `src/index.html` | Complete HTML structure |
| `src/styles.css` | Clean, minimal styling with dark mode |
| `src/main.js` | Tauri IPC integration |
| `src-tauri/icons/` | App and tray icons |
| Release binary | `.deb` package |

## Tasks

### Task 5.1: Create HTML Structure

```bash
/x:implement "Create src/index.html: Header with h1 'PortWatcher' and refresh button. Main section with table (thead: Process, PID, Port, Protocol, Action; tbody id='port-list' for JS population). Footer with status span and last-refresh time. Link styles.css and import main.js as module."
```

**Acceptance Criteria**:
- [ ] Valid HTML5 structure
- [ ] Table columns match PortInfo fields
- [ ] IDs for JS DOM manipulation

### Task 5.2: Create CSS Styles

```bash
/x:implement "Create src/styles.css: System font stack (-apple-system, system-ui, sans-serif). Light theme with subtle grays. Table with border-collapse, hover row highlight, alternating row colors. Kill button in red (#dc3545) with white text. Dark mode via @media (prefers-color-scheme: dark) with dark backgrounds and light text. Compact layout for 400px width. Refresh button styled as primary action."
```

**Acceptance Criteria**:
- [ ] Clean, readable table
- [ ] Kill button visually distinct (danger red)
- [ ] Dark mode support
- [ ] Fits 400x500 window

### Task 5.3: Implement Frontend JavaScript

```bash
/x:implement "Create src/main.js: Import invoke from '@tauri-apps/api/core'. loadPorts() async function calling invoke('get_ports'), updating status, calling renderPorts(). renderPorts(ports) generating table rows with escapeHtml() for process names and data-pid attribute on kill buttons. killProcess(pid) with confirm(), calling kill_process, handling PermissionDenied/ElevationRequired by prompting for pkexec elevation, refreshing on success. escapeHtml() using textContent/innerHTML trick. Event listeners for refresh button and delegated click on kill buttons. Auto-refresh setInterval every 5 seconds. Call loadPorts() on DOMContentLoaded."
```

**Acceptance Criteria**:
- [ ] Ports load on startup
- [ ] Kill with confirmation works
- [ ] Elevation prompt on permission denied
- [ ] Auto-refresh every 5s
- [ ] XSS prevented

### Task 5.4: Add Application Icons

```bash
/x:implement "Create or source app icons for src-tauri/icons/: 32x32.png, 128x128.png, 256x256.png for app icon (simple network/connection symbol). 32x32 tray icon (monochrome, simple). Update tauri.conf.json icon paths. Can use simple geometric design or source from open icon set."
```

**Acceptance Criteria**:
- [ ] Tray shows custom icon
- [ ] Window has app icon
- [ ] Icons look professional

### Task 5.5: Build & Test Release

```bash
/x:implement "Build release: Run 'cargo tauri build' in project root. Verify bundle created in src-tauri/target/release/bundle/. Test .deb installation on Ubuntu. Document any runtime dependencies (libwebkit2gtk, libappindicator3). Create basic README.md with installation instructions."
```

**Acceptance Criteria**:
- [ ] Release builds successfully
- [ ] .deb package installs
- [ ] App runs on fresh Ubuntu 22.04
- [ ] README has install instructions

## Technical Details

### JavaScript Event Delegation

```javascript
// Delegated click handler for kill buttons
document.getElementById('port-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('kill-btn')) {
        const pid = parseInt(e.target.dataset.pid, 10);
        killProcess(pid);
    }
});
```

### Dark Mode CSS

```css
@media (prefers-color-scheme: dark) {
    body {
        background: #1e1e1e;
        color: #e0e0e0;
    }
    table {
        background: #2d2d2d;
    }
    tr:hover {
        background: #3d3d3d;
    }
}
```

### Tauri Build Output

```
src-tauri/target/release/bundle/
├── deb/
│   └── portwatcher_0.1.0_amd64.deb
└── appimage/
    └── portwatcher_0.1.0_amd64.AppImage
```

## Success Criteria

- [ ] UI renders correctly
- [ ] All interactions work
- [ ] Dark/light mode supported
- [ ] Icons display properly
- [ ] Release binary < 20MB
- [ ] Memory < 50MB idle

## Final Verification Checklist

- [ ] Fresh Ubuntu 22.04 VM test
- [ ] Tray icon appears
- [ ] Left-click opens window with ports
- [ ] Kill owned process works
- [ ] Kill other's process prompts pkexec
- [ ] Refresh updates list
- [ ] Quit exits cleanly
- [ ] No console errors

## Dependencies

- Milestones 1-4: Complete backend and tray

## Completion

After this milestone:
- **Full release ready**
- Can distribute .deb package
- Feature complete for MVP

---

**End of Initiative**: After M5, run `/x:archive portwatcher-2025`
