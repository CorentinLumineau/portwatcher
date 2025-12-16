#!/bin/bash
#
# PortWatcher Uninstaller
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/portwatcher/main/scripts/uninstall.sh | bash
#

set -e

# Configuration
APP_NAME="portwatcher"
APP_DISPLAY_NAME="PortWatcher"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        error "Please do not run this script as root. It will ask for sudo when needed."
    fi
}

# Check if PortWatcher is installed
check_installed() {
    if ! dpkg -l | grep -q "$APP_NAME"; then
        error "PortWatcher is not installed on this system."
    fi
}

# Stop running instances
stop_portwatcher() {
    info "Stopping PortWatcher if running..."
    pkill -f "$APP_NAME" 2>/dev/null || true
    success "Stopped any running instances"
}

# Remove the package
remove_package() {
    info "Removing PortWatcher package..."
    sudo dpkg --remove "$APP_NAME" || {
        warn "dpkg remove failed, trying purge..."
        sudo dpkg --purge "$APP_NAME"
    }
    success "Package removed"
}

# Remove autostart entry
remove_autostart() {
    AUTOSTART_FILE="$HOME/.config/autostart/portwatcher.desktop"
    if [ -f "$AUTOSTART_FILE" ]; then
        info "Removing autostart entry..."
        rm -f "$AUTOSTART_FILE"
        success "Autostart entry removed"
    fi
}

# Remove user config (optional)
remove_config() {
    CONFIG_DIR="$HOME/.config/portwatcher"
    if [ -d "$CONFIG_DIR" ]; then
        read -p "Remove PortWatcher configuration files? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$CONFIG_DIR"
            success "Configuration files removed"
        else
            info "Configuration files kept at: $CONFIG_DIR"
        fi
    fi
}

# Remove cache (optional)
remove_cache() {
    CACHE_DIR="$HOME/.cache/portwatcher"
    if [ -d "$CACHE_DIR" ]; then
        info "Removing cache..."
        rm -rf "$CACHE_DIR"
        success "Cache removed"
    fi
}

# Print completion message
print_info() {
    echo ""
    echo "==========================================="
    success "PortWatcher has been uninstalled!"
    echo "==========================================="
    echo ""
    echo "To reinstall, run:"
    echo "  curl -fsSL https://raw.githubusercontent.com/CorentinLumineau/portwatcher/main/scripts/install.sh | bash"
    echo ""
}

# Main uninstall flow
main() {
    echo ""
    echo "==========================================="
    echo "  PortWatcher Uninstaller"
    echo "==========================================="
    echo ""

    check_root
    check_installed
    stop_portwatcher
    remove_package
    remove_autostart
    remove_config
    remove_cache
    print_info
}

# Run main function
main "$@"
