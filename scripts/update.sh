#!/bin/bash
#
# PortWatcher Updater
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/portwatcher/main/scripts/update.sh | bash
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

# Get current installed version
get_current_version() {
    if dpkg -l | grep -q "$APP_NAME"; then
        CURRENT_VERSION=$(dpkg -l | grep "$APP_NAME" | awk '{print $3}')
        info "Current version: $CURRENT_VERSION"
    else
        error "PortWatcher is not installed. Please run install.sh first."
    fi
}

# Get latest release version from GitHub
get_latest_version() {
    info "Checking for updates..."

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

# Compare versions
compare_versions() {
    # Simple version comparison - assumes semver format
    if [ "$CURRENT_VERSION" = "$VERSION" ]; then
        success "You already have the latest version ($VERSION)"
        exit 0
    fi

    # Check if current version is newer (in case of downgrade attempt)
    if dpkg --compare-versions "$CURRENT_VERSION" gt "$VERSION" 2>/dev/null; then
        warn "Installed version ($CURRENT_VERSION) is newer than latest release ($VERSION)"
        read -p "Do you want to downgrade? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Update cancelled"
            exit 0
        fi
    else
        info "Update available: $CURRENT_VERSION -> $VERSION"
    fi
}

# Stop running instances
stop_portwatcher() {
    if pgrep -f "$APP_NAME" > /dev/null 2>&1; then
        info "Stopping PortWatcher..."
        pkill -f "$APP_NAME" 2>/dev/null || true
        sleep 1
        success "Stopped running instances"
    fi
}

# Download and install the update
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

    # Install the package (upgrade)
    info "Installing update..."
    sudo dpkg -i "$TMP_DIR/$DEB_FILE" || {
        warn "dpkg failed, attempting to fix dependencies..."
        sudo apt-get install -f -y
        sudo dpkg -i "$TMP_DIR/$DEB_FILE"
    }

    success "Update installed successfully"
}

# Print completion message
print_info() {
    echo ""
    echo "==========================================="
    success "PortWatcher updated to v${VERSION}!"
    echo "==========================================="
    echo ""
    echo "To start PortWatcher:"
    echo "  - Search for 'PortWatcher' in your application menu"
    echo "  - Or run: portwatcher"
    echo ""
}

# Main update flow
main() {
    echo ""
    echo "==========================================="
    echo "  PortWatcher Updater"
    echo "==========================================="
    echo ""

    check_root
    detect_arch
    get_current_version
    get_latest_version
    compare_versions
    stop_portwatcher
    download_and_install
    print_info
}

# Run main function
main "$@"
