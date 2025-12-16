// PortWatcher Frontend

const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

// DOM elements
const portList = document.getElementById('port-list');
const refreshBtn = document.getElementById('refresh-btn');
const status = document.getElementById('status');
const lastRefresh = document.getElementById('last-refresh');
const emptyState = document.getElementById('empty-state');
const portTable = document.getElementById('port-table');

// Auto-refresh interval (5 seconds)
const AUTO_REFRESH_INTERVAL = 5000;
let autoRefreshTimer = null;

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Format timestamp for display
 * @returns {string} Formatted time string
 */
function formatTime() {
    return new Date().toLocaleTimeString();
}

/**
 * Load and display ports
 */
async function loadPorts() {
    status.textContent = 'Loading...';
    status.classList.add('loading');

    try {
        const ports = await invoke('get_ports');
        renderPorts(ports);
        status.classList.remove('loading');
        status.textContent = `${ports.length} port${ports.length !== 1 ? 's' : ''}`;
        lastRefresh.textContent = `Last updated: ${formatTime()}`;
    } catch (err) {
        console.error('Failed to load ports:', err);
        status.classList.remove('loading');
        status.textContent = `Error: ${err}`;
    }
}

/**
 * Render ports to the table
 * @param {Array} ports - Array of port info objects
 */
function renderPorts(ports) {
    if (ports.length === 0) {
        portTable.style.display = 'none';
        emptyState.style.display = 'flex';
        portList.innerHTML = '';
        return;
    }

    portTable.style.display = 'table';
    emptyState.style.display = 'none';

    portList.innerHTML = ports.map(p => `
        <tr>
            <td title="${escapeHtml(p.process_name)}">${escapeHtml(p.process_name)}</td>
            <td>${p.pid}</td>
            <td>${p.port}</td>
            <td>
                <span class="protocol-badge protocol-${p.protocol.toLowerCase()}">
                    ${p.protocol}
                </span>
            </td>
            <td>${escapeHtml(p.address)}</td>
            <td>${escapeHtml(p.user)}</td>
            <td>
                <button class="btn-danger kill-btn" data-pid="${p.pid}" data-name="${escapeHtml(p.process_name)}">
                    Kill
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Kill a process by PID
 * @param {number} pid - Process ID to kill
 * @param {string} name - Process name for display
 */
async function killProcess(pid, name) {
    if (!confirm(`Kill process "${name}" (PID: ${pid})?`)) {
        return;
    }

    try {
        let result = await invoke('kill_process', { pid });

        // Handle permission denied - offer elevation
        if (result.status === 'PermissionDenied' || result.status === 'ElevationRequired') {
            if (confirm(`Permission denied. Kill with elevated privileges?\n\nThis will prompt for your password.`)) {
                result = await invoke('kill_process_elevated', { pid });
            } else {
                return;
            }
        }

        // Handle result
        switch (result.status) {
            case 'Success':
                // Refresh the list
                await loadPorts();
                break;
            case 'ProcessNotFound':
                alert(`Process ${pid} not found. It may have already exited.`);
                await loadPorts();
                break;
            case 'PermissionDenied':
                alert(`Permission denied to kill process ${pid}.`);
                break;
            case 'Error':
                alert(`Error: ${result.message}`);
                break;
        }
    } catch (err) {
        console.error('Failed to kill process:', err);
        alert(`Failed to kill process: ${err}`);
    }
}

/**
 * Handle click events on the port list (event delegation)
 * @param {Event} event - Click event
 */
function handlePortListClick(event) {
    const target = event.target;

    if (target.classList.contains('kill-btn')) {
        const pid = parseInt(target.dataset.pid, 10);
        const name = target.dataset.name;
        killProcess(pid, name);
    }
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
    autoRefreshTimer = setInterval(loadPorts, AUTO_REFRESH_INTERVAL);
}

/**
 * Stop auto-refresh timer
 */
function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

/**
 * Initialize the application
 */
async function init() {
    // Event listeners
    refreshBtn.addEventListener('click', loadPorts);
    portList.addEventListener('click', handlePortListClick);

    // Listen for refresh event from tray menu
    await listen('refresh-ports', () => {
        loadPorts();
    });

    // Handle visibility change to pause/resume auto-refresh
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            loadPorts();
            startAutoRefresh();
        }
    });

    // Initial load
    await loadPorts();

    // Start auto-refresh
    startAutoRefresh();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
