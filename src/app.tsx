import { useEffect, useCallback } from 'preact/hooks';
import { signal } from '@preact/signals';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { RangeScanner } from './components/RangeScanner';
import { PortTable } from './components/PortTable';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, showToast } from './components/Toast';
import { usePorts } from './hooks/usePorts';
import { useSettings } from './hooks/useSettings';
import { useTauriEvents } from './hooks/useTauriEvents';
import {
  searchQuery,
  filters,
  sortConfig,
  isLoading,
  filteredPorts,
  portCount,
  filteredCount,
  presets,
} from './store/signals';
import type { KillResult } from './store/types';
import { Settings, Activity, Wifi, Moon, Sun } from 'lucide-preact';

const showSettings = signal(false);

export function App() {
  const { fetchPorts, scanRange, killProcess } = usePorts();
  const { settings, load: loadSettings, save: saveSettings } = useSettings();

  // Wrap kill process to show toast notifications
  const handleKillProcess = useCallback(
    async (pid: number, elevated: boolean): Promise<KillResult> => {
      const result = await killProcess(pid, elevated);
      switch (result.status) {
        case 'Success':
          showToast('success', `Process ${pid} terminated successfully`);
          break;
        case 'PermissionDenied':
        case 'ElevationRequired':
          showToast('info', 'Elevation required. Click the shield button to retry with sudo.');
          break;
        case 'ProcessNotFound':
          showToast('info', `Process ${pid} not found (may have already exited)`);
          break;
        case 'Error':
          showToast('error', result.message || 'Failed to kill process');
          break;
      }
      return result;
    },
    [killProcess]
  );

  // Initialize on mount
  useEffect(() => {
    loadSettings();
    fetchPorts();
  }, []);

  // Auto-refresh based on settings
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPorts();
    }, settings.value.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.value.refreshInterval]);

  // Listen to Tauri events
  useTauriEvents({
    fetchPorts,
    scanRange,
    onOpenSettings: () => (showSettings.value = true),
  });

  const handleSort = (column: typeof sortConfig.value.column) => {
    if (sortConfig.value.column === column) {
      sortConfig.value = {
        ...sortConfig.value,
        direction: sortConfig.value.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      sortConfig.value = { column, direction: 'asc' };
    }
  };

  return (
    <div class="flex flex-col h-screen bg-cyber-black relative overflow-hidden">
      {/* Background Effects */}
      <div class="absolute inset-0 bg-glow-top pointer-events-none" />
      <div class="absolute inset-0 scanlines pointer-events-none opacity-50" />

      {/* Header */}
      <header class="relative z-10 flex-shrink-0 glass-panel border-0 border-b border-cyber-border/50">
        {/* Title Bar */}
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            {/* Logo */}
            <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/30">
              <Wifi class="w-5 h-5 text-neon-cyan" />
              <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green shadow-neon-green animate-pulse" />
            </div>
            {/* Title */}
            <div>
              <h1 class="text-lg font-display font-semibold text-white tracking-tight">
                Port<span class="text-neon-cyan">Watcher</span>
              </h1>
              <div class="flex items-center gap-2 text-xxs text-cyber-muted">
                <Activity class="w-3 h-3" />
                <span class="font-mono">NETWORK MONITOR</span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div class="flex items-center gap-2">
            <button
              onClick={() => {
                const newTheme = settings.value.display.theme === 'dark' ? 'light' : 'dark';
                saveSettings({
                  ...settings.value,
                  display: {
                    ...settings.value.display,
                    theme: newTheme,
                  },
                });
                document.documentElement.setAttribute('data-theme', newTheme);
              }}
              class="btn-icon group"
              title={`Switch to ${settings.value.display.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {settings.value.display.theme === 'dark' ? (
                <Sun class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
              ) : (
                <Moon class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
              )}
            </button>
            <button
              onClick={() => (showSettings.value = true)}
              class="btn-icon group"
              title="Settings (Ctrl+,)"
            >
              <Settings class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div class="px-5 pb-4 space-y-3">
          <SearchBar
            value={searchQuery.value}
            onChange={(value) => (searchQuery.value = value)}
            placeholder="Search by process, port, or address..."
          />
          <div class="flex flex-wrap gap-3 items-center">
            <FilterPanel
              filters={filters.value}
              onChange={(newFilters) => (filters.value = newFilters)}
              onClear={() =>
                (filters.value = {
                  protocol: 'all',
                  state: 'all',
                  user: 'all',
                  portRange: null,
                })
              }
            />
            <div class="divider-vertical" />
            <RangeScanner
              onScan={scanRange}
              presets={presets.value}
              isScanning={isLoading.value}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="relative z-10 flex-1 overflow-hidden px-5 py-4">
        <PortTable
          ports={filteredPorts.value}
          onKill={handleKillProcess}
          sortColumn={sortConfig.value.column}
          sortDirection={sortConfig.value.direction}
          onSort={handleSort}
          isLoading={isLoading.value}
        />
      </main>

      {/* Footer */}
      <StatusBar
        totalCount={portCount.value}
        filteredCount={filteredCount.value}
        onRefresh={fetchPorts}
        isLoading={isLoading.value}
      />

      {/* Settings Modal */}
      {showSettings.value && (
        <SettingsModal
          settings={settings.value}
          onSave={(newSettings) => {
            saveSettings(newSettings);
            showSettings.value = false;
          }}
          onClose={() => (showSettings.value = false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
