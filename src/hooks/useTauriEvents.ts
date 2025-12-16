import { useEffect } from 'preact/hooks';
import { listen } from '@tauri-apps/api/event';
import { presets } from '../store/signals';

interface UseTauriEventsProps {
  fetchPorts: () => Promise<void>;
  scanRange: (start: number, end: number) => Promise<void>;
  onOpenSettings?: () => void;
}

interface ScanPresetPayload {
  preset_id: string;
}

export function useTauriEvents({ fetchPorts, scanRange, onOpenSettings }: UseTauriEventsProps) {
  useEffect(() => {
    const unlisteners: (() => void)[] = [];

    // Listen for refresh-ports event from tray
    listen('refresh-ports', () => {
      fetchPorts();
    }).then((unlisten) => unlisteners.push(unlisten));

    // Listen for scan-preset event from tray
    listen<ScanPresetPayload>('scan-preset', (event) => {
      const preset = presets.value.find((p) => p.id === event.payload.preset_id);
      if (preset) {
        // Scan all ranges in the preset
        preset.ranges.forEach((range) => {
          scanRange(range.start, range.end);
        });

        // If preset has specific ports, scan them individually
        if (preset.ports.length > 0) {
          const minPort = Math.min(...preset.ports);
          const maxPort = Math.max(...preset.ports);
          scanRange(minPort, maxPort);
        }
      }
    }).then((unlisten) => unlisteners.push(unlisten));

    // Listen for open-settings event from tray
    listen('open-settings', () => {
      onOpenSettings?.();
    }).then((unlisten) => unlisteners.push(unlisten));

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchPorts();
      }
      // Ctrl+, to open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        onOpenSettings?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      unlisteners.forEach((unlisten) => unlisten());
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fetchPorts, scanRange, onOpenSettings]);
}
