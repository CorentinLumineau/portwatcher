# PortWatcher Documentation Hub

A system tray application for Linux that monitors network ports and allows process termination.

## Quick Navigation

| Section | Purpose | Key Files |
|---------|---------|-----------|
| [domain/](./domain/CLAUDE.md) | Business requirements | [Requirements](./domain/portwatcher-requirements.md) |
| [development/](./development/CLAUDE.md) | Setup & contribution | [Dev Guide](./development/README.md) |
| [implementation/](./implementation/CLAUDE.md) | Technical architecture | [Architecture](./implementation/portwatcher-architecture.md) |
| [milestones/](./milestones/CLAUDE.md) | Initiative tracking | [Master Plan](./milestones/MASTER-PLAN.md) |
| [reference/](./reference/CLAUDE.md) | API & stack docs | [Reference](./reference/README.md) |
| [workflows/](./workflows/CLAUDE.md) | Implementation guides | [Workflow](./workflows/portwatcher-workflow.md) |

## Project Overview

**Tech Stack**: Tauri v2 + Rust + Vanilla JS

**Target**: Linux (Ubuntu 22.04+)

**Features**:
- System tray integration
- Port monitoring (TCP/UDP)
- One-click process termination
- pkexec privilege elevation

## Quick Commands

```bash
# Development
cargo tauri dev          # Run in dev mode
cargo test               # Run tests
cargo tauri build        # Build release

# Documentation
/x:implement            # Implement features
/x:verify               # Verify implementation
/x:continue             # Continue initiative
```

## Configuration

See [config.yaml](./config.yaml) for project stack configuration.
