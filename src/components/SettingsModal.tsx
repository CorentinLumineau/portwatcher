import { useState } from 'preact/hooks';
import { Modal, Select, Input } from './common';
import { Settings, Monitor, Bell } from 'lucide-preact';
import type { AppSettings } from '../store/types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

type TabId = 'general' | 'display' | 'notifications';

const tabIcons = {
  general: Settings,
  display: Monitor,
  notifications: Bell,
};

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...partial }));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'display', label: 'Display' },
    { id: 'notifications', label: 'Alerts' },
  ];

  return (
    <Modal
      title="Settings"
      isOpen={true}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            class="btn btn-primary"
          >
            Save Changes
          </button>
        </>
      }
    >
      {/* Tabs */}
      <div class="flex gap-1 p-1 mb-5 rounded-lg bg-cyber-dark/50 border border-cyber-border/30">
        {tabs.map((tab) => {
          const Icon = tabIcons[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              class={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                  : 'text-cyber-muted hover:text-gray-300 hover:bg-glass-light border border-transparent'
              }`}
            >
              <Icon class="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div class="space-y-5">
        {activeTab === 'general' && (
          <>
            <Select
              label="Refresh Interval"
              value={localSettings.refreshInterval.toString()}
              onChange={(value) =>
                updateSettings({ refreshInterval: parseInt(value, 10) })
              }
              options={[
                { value: '1000', label: '1 second' },
                { value: '5000', label: '5 seconds' },
                { value: '10000', label: '10 seconds' },
                { value: '30000', label: '30 seconds' },
                { value: '60000', label: '1 minute' },
              ]}
            />

            <div class="space-y-3">
              <label class="block text-xxs font-semibold uppercase tracking-wider text-cyber-muted">
                Startup Options
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={localSettings.startMinimized}
                    onChange={(e) =>
                      updateSettings({ startMinimized: e.currentTarget.checked })
                    }
                    class="peer sr-only"
                  />
                  <div class="w-5 h-5 rounded border border-cyber-border bg-cyber-dark/60 peer-checked:bg-neon-cyan/20 peer-checked:border-neon-cyan/50 transition-all duration-200" />
                  <div class="absolute inset-0 flex items-center justify-center text-neon-cyan opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Start minimized to tray
                </span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={localSettings.startOnLogin}
                    onChange={(e) =>
                      updateSettings({ startOnLogin: e.currentTarget.checked })
                    }
                    class="peer sr-only"
                  />
                  <div class="w-5 h-5 rounded border border-cyber-border bg-cyber-dark/60 peer-checked:bg-neon-cyan/20 peer-checked:border-neon-cyan/50 transition-all duration-200" />
                  <div class="absolute inset-0 flex items-center justify-center text-neon-cyan opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Start on system login
                </span>
              </label>
            </div>
          </>
        )}

        {activeTab === 'display' && (
          <>
            <Select
              label="Default View"
              value={localSettings.display.defaultView}
              onChange={(value) =>
                updateSettings({
                  display: {
                    ...localSettings.display,
                    defaultView: value as AppSettings['display']['defaultView'],
                  },
                })
              }
              options={[
                { value: 'all', label: 'All Ports' },
                { value: 'listening', label: 'Listening Only' },
              ]}
            />

            <Select
              label="Default Sort Column"
              value={localSettings.display.defaultSort}
              onChange={(value) =>
                updateSettings({
                  display: {
                    ...localSettings.display,
                    defaultSort: value as AppSettings['display']['defaultSort'],
                  },
                })
              }
              options={[
                { value: 'port', label: 'Port' },
                { value: 'process', label: 'Process Name' },
                { value: 'pid', label: 'PID' },
                { value: 'protocol', label: 'Protocol' },
              ]}
            />

            <Select
              label="Default Sort Direction"
              value={localSettings.display.defaultSortDirection}
              onChange={(value) =>
                updateSettings({
                  display: {
                    ...localSettings.display,
                    defaultSortDirection: value as AppSettings['display']['defaultSortDirection'],
                  },
                })
              }
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
            />

            <Select
              label="Theme"
              value={localSettings.display.theme}
              onChange={(value) =>
                updateSettings({
                  display: {
                    ...localSettings.display,
                    theme: value as AppSettings['display']['theme'],
                  },
                })
              }
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <div class="space-y-3">
              <label class="block text-xxs font-semibold uppercase tracking-wider text-cyber-muted">
                Notification Settings
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.enabled}
                    onChange={(e) =>
                      updateSettings({
                        notifications: {
                          ...localSettings.notifications,
                          enabled: e.currentTarget.checked,
                        },
                      })
                    }
                    class="peer sr-only"
                  />
                  <div class="w-5 h-5 rounded border border-cyber-border bg-cyber-dark/60 peer-checked:bg-neon-cyan/20 peer-checked:border-neon-cyan/50 transition-all duration-200" />
                  <div class="absolute inset-0 flex items-center justify-center text-neon-cyan opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Enable notifications
                </span>
              </label>

              <label class={`flex items-center gap-3 cursor-pointer group ${!localSettings.notifications.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.soundEnabled}
                    disabled={!localSettings.notifications.enabled}
                    onChange={(e) =>
                      updateSettings({
                        notifications: {
                          ...localSettings.notifications,
                          soundEnabled: e.currentTarget.checked,
                        },
                      })
                    }
                    class="peer sr-only"
                  />
                  <div class="w-5 h-5 rounded border border-cyber-border bg-cyber-dark/60 peer-checked:bg-neon-cyan/20 peer-checked:border-neon-cyan/50 transition-all duration-200" />
                  <div class="absolute inset-0 flex items-center justify-center text-neon-cyan opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Enable sound alerts
                </span>
              </label>
            </div>

            <div class={!localSettings.notifications.enabled ? 'opacity-50 pointer-events-none' : ''}>
              <Input
                label="Watched Ports (comma-separated)"
                placeholder="80, 443, 3000, 8080"
                value={localSettings.notifications.watchedPorts.join(', ')}
                disabled={!localSettings.notifications.enabled}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  const ports = value
                    .split(',')
                    .map((p) => parseInt(p.trim(), 10))
                    .filter((p) => !isNaN(p) && p > 0 && p <= 65535);
                  updateSettings({
                    notifications: {
                      ...localSettings.notifications,
                      watchedPorts: ports,
                    },
                  });
                }}
                helperText="Get notified when these ports become active"
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
