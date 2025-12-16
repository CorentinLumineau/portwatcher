# Development Documentation

Setup guides, development workflows, and contribution guidelines.

## Contents

- [Development Guide](./README.md) - Setup and contribution guide

## Quick Start

```bash
# Prerequisites
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev

# Run development
cargo tauri dev

# Run tests
cd src-tauri && cargo test

# Build release
cargo tauri build
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `cargo tauri dev` | Run in development mode |
| `cargo test` | Run all tests |
| `cargo tauri build` | Build release binary |
