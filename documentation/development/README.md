# Development Guide

## Prerequisites

- **Rust**: 1.75 or later
- **Tauri CLI**: `cargo install tauri-cli`
- **Linux dependencies**:
  ```bash
  # Ubuntu/Debian
  sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
  ```

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd portwatcher

# Run in development mode
cargo tauri dev

# Run tests
cd src-tauri && cargo test

# Build for release
cargo tauri build
```

## Project Structure

```
portwatcher/
├── src/                    # Frontend (HTML/CSS/JS)
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling (light/dark mode)
│   └── main.js             # Tauri IPC integration
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # App entry, system tray
│   │   ├── lib.rs          # Module exports
│   │   ├── types.rs        # Shared data types
│   │   ├── port_scanner.rs # /proc/net parsing
│   │   ├── process_resolver.rs # PID resolution
│   │   ├── process_manager.rs  # Kill operations
│   │   └── commands.rs     # Tauri commands
│   └── icons/              # Application icons
└── documentation/          # Project documentation
```

## Development Workflow

### Running Tests

```bash
cd src-tauri
cargo test                 # Run all tests
cargo test port_scanner    # Run specific module tests
```

### Code Style

- Rust: Follow standard Rust conventions
- JavaScript: ES2022+ modules
- CSS: CSS custom properties for theming

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally with `cargo tauri dev`
3. Run tests: `cargo test`
4. Commit with conventional commits: `feat: add feature`
5. Create pull request

## Architecture Overview

See [Implementation Architecture](../implementation/portwatcher-architecture.md) for detailed technical documentation.

### Key Modules

| Module | Purpose |
|--------|---------|
| `port_scanner` | Parses /proc/net/tcp and /proc/net/udp |
| `process_resolver` | Maps socket inodes to process info |
| `process_manager` | Handles process termination |
| `commands` | Tauri IPC command handlers |

## Debugging

### Development Tools

- Browser DevTools: Inspect the webview
- Rust logging: Set `RUST_LOG=debug`
- Tauri DevTools: Built into dev mode

### Common Issues

**Port list empty:**
- Check if running as user with access to /proc
- Some ports may require elevated privileges to see

**System tray not showing:**
- Ensure libappindicator3 is installed
- Check GNOME extensions for AppIndicator support

## Contributing

1. Read the [Requirements](../domain/portwatcher-requirements.md)
2. Check existing [Issues](https://github.com/your-repo/issues)
3. Follow the development workflow above
4. Ensure tests pass before submitting PR
