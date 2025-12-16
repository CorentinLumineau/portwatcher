import { invoke } from '@tauri-apps/api/core';
import type { PortInfo, KillResult, PortPreset, TrayStats } from '../store/types';

/**
 * Get all listening ports with their process information
 */
export async function getPorts(): Promise<PortInfo[]> {
  return invoke<PortInfo[]>('get_ports');
}

/**
 * Scan a specific port range
 */
export async function scanPortRange(start: number, end: number): Promise<PortInfo[]> {
  return invoke<PortInfo[]>('scan_port_range', { start, end });
}

/**
 * Kill a process by PID
 */
export async function killProcess(pid: number): Promise<KillResult> {
  return invoke<KillResult>('kill_process', { pid });
}

/**
 * Kill a process by PID using elevated privileges (pkexec)
 */
export async function killProcessElevated(pid: number): Promise<KillResult> {
  return invoke<KillResult>('kill_process_elevated', { pid });
}

/**
 * Get built-in port presets
 */
export async function getPresets(): Promise<PortPreset[]> {
  return invoke<PortPreset[]>('get_presets');
}

/**
 * Get tray statistics (port counts)
 */
export async function getTrayStats(): Promise<TrayStats> {
  return invoke<TrayStats>('get_tray_stats');
}
