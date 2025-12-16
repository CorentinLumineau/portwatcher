# Domain Documentation

Business logic, requirements, and domain knowledge for PortWatcher.

## Contents

- [Requirements](./portwatcher-requirements.md) - Feature requirements and specifications

## Quick Reference

**Problem**: Developers need to identify and kill processes on ports without terminal commands.

**Solution**: System tray app showing listening ports with one-click kill.

**Core Features**:
- System tray integration (Ubuntu/GNOME)
- Port list display (Process, PID, Port, Protocol)
- Kill process with confirmation
- pkexec elevation for root processes
