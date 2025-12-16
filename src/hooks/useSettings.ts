import { settings } from '../store/signals';
import { defaultSettings } from '../store/types';
import type { AppSettings } from '../store/types';

// For now, use localStorage as a fallback until tauri-plugin-store is properly configured
const SETTINGS_KEY = 'portwatcher-settings';

export function useSettings() {
  const load = async () => {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        settings.value = { ...defaultSettings, ...parsed };
      }

      // TODO: Once tauri-plugin-store is configured, use:
      // const { Store } = await import('@tauri-apps/plugin-store');
      // const store = new Store('settings.json');
      // const saved = await store.get<AppSettings>('settings');
      // if (saved) {
      //   settings.value = { ...defaultSettings, ...saved };
      // }
    } catch (error) {
      console.error('Failed to load settings:', error);
      settings.value = defaultSettings;
    }
  };

  const save = async (newSettings: AppSettings) => {
    try {
      settings.value = newSettings;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      // TODO: Once tauri-plugin-store is configured, use:
      // const { Store } = await import('@tauri-apps/plugin-store');
      // const store = new Store('settings.json');
      // await store.set('settings', newSettings);
      // await store.save();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return { settings, load, save };
}
