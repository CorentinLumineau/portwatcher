import { getPorts, scanPortRange, killProcess, killProcessElevated, getPresets } from '../lib/tauri';
import { ports, isLoading, presets, lastRefresh, filteredPorts } from '../store/signals';
import type { KillResult } from '../store/types';

export function usePorts() {
  const fetchPorts = async () => {
    isLoading.value = true;
    try {
      const [portList, presetList] = await Promise.all([
        getPorts(),
        presets.value.length === 0 ? getPresets() : Promise.resolve(presets.value),
      ]);
      ports.value = portList;
      if (presets.value.length === 0) {
        presets.value = presetList;
      }
      lastRefresh.value = new Date();
    } catch (error) {
      console.error('Failed to fetch ports:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const scanRange = async (start: number, end: number) => {
    isLoading.value = true;
    try {
      const result = await scanPortRange(start, end);
      // Merge with existing ports, avoiding duplicates
      const existing = new Map(
        ports.value.map((p) => [`${p.port}-${p.protocol}-${p.pid}`, p])
      );
      result.forEach((p) => existing.set(`${p.port}-${p.protocol}-${p.pid}`, p));
      ports.value = Array.from(existing.values());
      lastRefresh.value = new Date();
    } catch (error) {
      console.error('Failed to scan port range:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const handleKillProcess = async (pid: number, elevated: boolean): Promise<KillResult> => {
    try {
      const result = elevated
        ? await killProcessElevated(pid)
        : await killProcess(pid);

      // If successful, refresh ports
      if (result.status === 'Success') {
        await fetchPorts();
      }

      return result;
    } catch (error) {
      console.error('Failed to kill process:', error);
      return { status: 'Error', message: String(error) };
    }
  };

  return {
    fetchPorts,
    scanRange,
    killProcess: handleKillProcess,
    ports: filteredPorts,
  };
}
