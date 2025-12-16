#!/bin/bash
#
# PortWatcher Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/portwatcher/main/scripts/install.sh | bash
#
# This script:
# 1. Detects system architecture
# 2. Installs required dependencies
# 3. Downloads the latest release from GitHub
# 4. Installs the .deb package
# 5. Creates desktop integration
#

set -e

# Configuration
REPO="CorentinLumineau/portwatcher"
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

# Detect architecture
detect_arch() {
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64)
            DEB_ARCH="amd64"
            ;;
        aarch64)
            DEB_ARCH="arm64"
            ;;
        armv7l)
            DEB_ARCH="armhf"
            ;;
        *)
            error "Unsupported architecture: $ARCH"
            ;;
    esac
    info "Detected architecture: $ARCH ($DEB_ARCH)"
}

# Detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO="$ID"
        DISTRO_VERSION="$VERSION_ID"
    else
        error "Cannot detect Linux distribution. /etc/os-release not found."
    fi

    case "$DISTRO" in
        ubuntu|debian|linuxmint|pop|elementary|zorin)
            PACKAGE_MANAGER="apt"
            ;;
        fedora|rhel|centos|rocky|alma)
            PACKAGE_MANAGER="dnf"
            warn "RPM packages are not yet available. Please build from source."
            exit 1
            ;;
        arch|manjaro|endeavouros)
            PACKAGE_MANAGER="pacman"
            warn "Arch packages are not yet available. Please build from source."
            exit 1
            ;;
        *)
            error "Unsupported distribution: $DISTRO"
            ;;
    esac

    info "Detected distribution: $DISTRO $DISTRO_VERSION (using $PACKAGE_MANAGER)"
}

# Install dependencies
install_dependencies() {
    info "Installing dependencies..."

    case "$PACKAGE_MANAGER" in
        apt)
            sudo apt-get update
            sudo apt-get install -y \
                libwebkit2gtk-4.1-0 \
                libappindicator3-1 \
                curl \
                wget
            ;;
    esac

    success "Dependencies installed"
}

# Get latest release version from GitHub
get_latest_version() {
    info "Fetching latest release version..."

    LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | \
        grep '"tag_name":' | \
        sed -E 's/.*"([^"]+)".*/\1/')

    if [ -z "$LATEST_VERSION" ]; then
        error "Failed to fetch latest version. Check your internet connection."
    fi

    # Remove 'v' prefix if present
    VERSION="${LATEST_VERSION#v}"
    info "Latest version: $VERSION"
}

# Download and install the package
download_and_install() {
    info "Downloading PortWatcher v${VERSION}..."

    # Construct download URL
    DEB_FILE="${APP_NAME}_${VERSION}_${DEB_ARCH}.deb"
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_VERSION}/${DEB_FILE}"

    # Create temp directory
    TMP_DIR=$(mktemp -d)
    trap "rm -rf $TMP_DIR" EXIT

    # Download the .deb file
    info "Downloading from: $DOWNLOAD_URL"
    if ! curl -fsSL -o "$TMP_DIR/$DEB_FILE" "$DOWNLOAD_URL"; then
        error "Failed to download package. URL: $DOWNLOAD_URL"
    fi

    success "Download complete"

    # Install the package
    info "Installing PortWatcher..."
    sudo dpkg -i "$TMP_DIR/$DEB_FILE" || {
        warn "dpkg failed, attempting to fix dependencies..."
        sudo apt-get install -f -y
        sudo dpkg -i "$TMP_DIR/$DEB_FILE"
    }

    success "PortWatcher installed successfully"
}

# Setup autostart (optional)
setup_autostart() {
    read -p "Would you like PortWatcher to start automatically on login? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        AUTOSTART_DIR="$HOME/.config/autostart"
        mkdir -p "$AUTOSTART_DIR"

        cat > "$AUTOSTART_DIR/portwatcher.desktop" << EOF
[Desktop Entry]
Type=Application
Name=PortWatcher
Exec=/usr/bin/portwatcher
Icon=portwatcher
Comment=Monitor network ports and manage processes
Categories=System;Utility;
Terminal=false
StartupNotify=false
X-GNOME-Autostart-enabled=true
EOF

        success "Autostart configured"
    fi
}

# Print post-installation info
print_info() {
    echo ""
    echo "==========================================="
    success "PortWatcher has been installed!"
    echo "==========================================="
    echo ""
    echo "To start PortWatcher:"
    echo "  - Search for 'PortWatcher' in your application menu"
    echo "  - Or run: portwatcher"
    echo ""
    echo "To uninstall:"
    echo "  curl -fsSL https://raw.githubusercontent.com/CorentinLumineau/portwatcher/main/scripts/uninstall.sh | bash"
    echo ""
    echo "To update:"
    echo "  curl -fsSL https://raw.githubusercontent.com/CorentinLumineau/portwatcher/main/scripts/update.sh | bash"
    echo ""
}

# Main installation flow
main() {
    echo ""
    echo "==========================================="
    echo "  PortWatcher Installer"
    echo "==========================================="
    echo ""

    check_root
    detect_arch
    detect_distro
    install_dependencies
    get_latest_version
    download_and_install
    setup_autostart
    print_info
}

# Run main function
main "$@"
