import { useState } from 'preact/hooks';
import { Select } from './common';
import { Scan, Loader2, Zap } from 'lucide-preact';
import type { PortPreset } from '../store/types';

interface RangeScannerProps {
  onScan: (start: number, end: number) => void;
  presets: PortPreset[];
  isScanning: boolean;
}

export function RangeScanner({ onScan, presets, isScanning }: RangeScannerProps) {
  const [startPort, setStartPort] = useState('');
  const [endPort, setEndPort] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [error, setError] = useState('');

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    setError('');

    if (!presetId) {
      setStartPort('');
      setEndPort('');
      return;
    }

    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      // If preset has ranges, use the first one
      if (preset.ranges.length > 0) {
        setStartPort(preset.ranges[0].start.toString());
        setEndPort(preset.ranges[0].end.toString());
      } else if (preset.ports.length > 0) {
        // If preset has specific ports, use min and max
        const min = Math.min(...preset.ports);
        const max = Math.max(...preset.ports);
        setStartPort(min.toString());
        setEndPort(max.toString());
      }
    }
  };

  const handleScan = () => {
    const start = parseInt(startPort, 10);
    const end = parseInt(endPort, 10);

    // Validation
    if (isNaN(start) || isNaN(end)) {
      setError('Enter valid port numbers');
      return;
    }

    if (start < 1 || start > 65535 || end < 1 || end > 65535) {
      setError('Ports: 1-65535');
      return;
    }

    if (start > end) {
      setError('Start < End');
      return;
    }

    setError('');
    onScan(start, end);
  };

  const presetOptions = [
    { value: '', label: 'Quick Scan...' },
    ...presets.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div class="flex flex-wrap items-center gap-2">
      {/* Scan label */}
      <div class="flex items-center gap-1.5 text-cyber-muted">
        <Zap class="w-3.5 h-3.5" />
        <span class="text-xxs font-mono uppercase tracking-wider">Scan</span>
      </div>

      <div class="divider-vertical" />

      <Select
        value={selectedPreset}
        onChange={handlePresetChange}
        options={presetOptions}
        size="sm"
        class="w-[130px]"
      />

      <div class="flex items-center gap-1">
        <input
          type="number"
          value={startPort}
          onInput={(e) => {
            setStartPort(e.currentTarget.value);
            setError('');
          }}
          placeholder="Start"
          min="1"
          max="65535"
          class="w-[70px] px-2 py-1.5 rounded-lg text-xs font-mono
                 bg-cyber-dark/60 backdrop-blur-sm
                 border border-cyber-border/50
                 text-gray-200 placeholder-cyber-muted
                 transition-all duration-200
                 hover:border-cyber-muted/50
                 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20"
        />
        <span class="text-cyber-muted text-xs">—</span>
        <input
          type="number"
          value={endPort}
          onInput={(e) => {
            setEndPort(e.currentTarget.value);
            setError('');
          }}
          placeholder="End"
          min="1"
          max="65535"
          class="w-[70px] px-2 py-1.5 rounded-lg text-xs font-mono
                 bg-cyber-dark/60 backdrop-blur-sm
                 border border-cyber-border/50
                 text-gray-200 placeholder-cyber-muted
                 transition-all duration-200
                 hover:border-cyber-muted/50
                 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20"
        />
      </div>

      <button
        onClick={handleScan}
        disabled={!startPort || !endPort || isScanning}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
               bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30
               hover:bg-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-neon-cyan
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
               transition-all duration-200"
      >
        {isScanning ? (
          <Loader2 class="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Scan class="w-3.5 h-3.5" />
        )}
        <span class="text-xs font-medium">
          {isScanning ? 'Scanning' : 'Scan'}
        </span>
      </button>

      {error && (
        <span class="text-xxs text-neon-red font-medium animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
}
