# PortWatcher

A lightweight system tray application for Linux that displays all processes listening on network ports and allows one-click termination.

## Features

- **System Tray Integration**: Lives in your Ubuntu/GNOME top bar
- **Port Monitoring**: Shows all TCP and UDP listening ports
- **Process Information**: Displays process name, PID, port, protocol, address, and user
- **Kill Processes**: Terminate processes with a single click
- **Privilege Elevation**: Automatically prompts for pkexec when killing root processes
- **Auto-Refresh**: Updates every 5 seconds
- **Dark Mode**: Automatically adapts to system theme

## Screenshots

*Coming soon*

## Installation

### Quick Install (Recommended)

Install PortWatcher with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/CorentinLumineau/portwatcher/main/scripts/install.sh | bash
```

This will:
- Detect your system architecture
- Install required dependencies
- Download the latest release
- Set up desktop integration

### Update

```bash
curl -fsSL https://raw.githubusercontent.com/CorentinLumineau/portwatcher/main/scripts/update.sh | bash
```

### Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/CorentinLumineau/portwatcher/main/scripts/uninstall.sh | bash
```

### Manual Installation

Download the latest `.deb` package from the [Releases](https://github.com/CorentinLumineau/portwatcher/releases) page and install:

```bash
# Install dependencies first
sudo apt install libwebkit2gtk-4.1-0 libappindicator3-1

# Install the package
sudo dpkg -i portwatcher_*.deb
```

### From Source

#### Prerequisites

- Rust 1.75 or later
- Node.js (for Tauri CLI)
- Linux development dependencies:

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

#### Build

```bash
# Install Tauri CLI
cargo install tauri-cli

# Build release
cargo tauri build
```

The built packages will be in `src-tauri/target/release/bundle/`.

## Usage

1. Launch PortWatcher from your applications menu or run `portwatcher`
2. A network icon appears in your system tray
3. **Left-click** the icon to show/hide the port list window
4. **Right-click** for menu options:
   - **Refresh**: Update the port list
   - **Open Window**: Show the main window
   - **Quit**: Exit the application
5. Click **Kill** next to any process to terminate it
   - For processes owned by other users, you'll be prompted for your password

## Development

```bash
# Run in development mode
cargo tauri dev

# Run tests
cd src-tauri && cargo test
```

## Project Structure

```
portwatcher/
├── src/                    # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Application entry, tray setup
│   │   ├── lib.rs          # Module exports
│   │   ├── types.rs        # Shared data types
│   │   ├── port_scanner.rs # /proc/net parsing
│   │   ├── process_resolver.rs # PID resolution
│   │   ├── process_manager.rs  # Kill operations
│   │   └── commands.rs     # Tauri IPC handlers
│   └── icons/              # Application icons
└── documentation/          # Project documentation
```

## Technical Details

### Port Detection

PortWatcher reads `/proc/net/tcp` and `/proc/net/udp` to find listening sockets, then maps socket inodes to processes by scanning `/proc/[pid]/fd/` symlinks.

### Dependencies

| Crate | Purpose |
|-------|---------|
| tauri | Application framework |
| serde | Serialization |
| nix | Unix signal handling |
| users | User/group lookup |
| thiserror | Error handling |

## Requirements

- Linux (Ubuntu 22.04+ recommended)
- libwebkit2gtk-4.1
- libappindicator3 (for system tray)

## License

MIT

## Contributing

Contributions welcome! Please read the documentation in `/documentation` before submitting PRs.
