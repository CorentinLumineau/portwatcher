import { useState } from 'preact/hooks';
import { Skull, ShieldAlert, Loader2 } from 'lucide-preact';
import type { PortInfo, KillResult } from '../../store/types';

interface PortRowProps {
  port: PortInfo;
  onKill: (pid: number, elevated: boolean) => Promise<KillResult>;
  style?: { [key: string]: string | number };
}

export function PortRow({ port, onKill, style }: PortRowProps) {
  const [isKilling, setIsKilling] = useState(false);
  const [needsElevation, setNeedsElevation] = useState(false);

  const handleKill = async (elevated: boolean = false) => {
    setIsKilling(true);
    try {
      const result = await onKill(port.pid, elevated);

      if (result.status === 'ElevationRequired' || result.status === 'PermissionDenied') {
        setNeedsElevation(true);
      } else {
        setNeedsElevation(false);
      }
    } finally {
      setIsKilling(false);
    }
  };

  return (
    <div
      class="table-row flex items-center px-4 py-2.5 group"
      style={style}
    >
      {/* Process Name */}
      <div class="w-[180px] flex-shrink-0">
        <span
          class="block truncate text-sm font-medium text-gray-200 group-hover:text-white transition-colors"
          title={port.process_name}
        >
          {port.process_name}
        </span>
      </div>

      {/* PID */}
      <div class="w-[80px] flex-shrink-0">
        <span class="font-mono text-xs text-cyber-muted tabular-nums">
          {port.pid}
        </span>
      </div>

      {/* Port */}
      <div class="w-[80px] flex-shrink-0">
        <span class="font-mono text-xs text-neon-cyan font-medium tabular-nums">
          {port.port}
        </span>
      </div>

      {/* Protocol Badge */}
      <div class="w-[90px] flex-shrink-0">
        <span
          class={`badge ${
            port.protocol === 'Tcp' ? 'badge-tcp' : 'badge-udp'
          }`}
        >
          {port.protocol}
        </span>
      </div>

      {/* Address */}
      <div class="w-[200px] flex-shrink-0">
        <span
          class="block truncate font-mono text-xs text-cyber-muted"
          title={port.address}
        >
          {port.address}
        </span>
      </div>

      {/* User */}
      <div class="w-[100px] flex-shrink-0">
        <span
          class="block truncate text-xs text-cyber-muted"
          title={port.user}
        >
          {port.user}
        </span>
      </div>

      {/* Action */}
      <div class="w-[60px] flex-shrink-0 flex justify-end">
        {needsElevation ? (
          <button
            onClick={() => handleKill(true)}
            disabled={isKilling}
            class="btn btn-xs bg-neon-orange/20 text-neon-orange border border-neon-orange/30
                   hover:bg-neon-orange/30 hover:border-neon-orange/50
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-150"
            title="Kill with elevated privileges (sudo)"
          >
            {isKilling ? (
              <Loader2 class="w-3 h-3 animate-spin" />
            ) : (
              <ShieldAlert class="w-3 h-3" />
            )}
          </button>
        ) : (
          <button
            onClick={() => handleKill(false)}
            disabled={isKilling}
            class="btn btn-xs bg-neon-red/10 text-neon-red/70 border border-transparent
                   hover:bg-neon-red/20 hover:text-neon-red hover:border-neon-red/30
                   disabled:opacity-40 disabled:cursor-not-allowed
                   opacity-0 group-hover:opacity-100 focus:opacity-100
                   transition-all duration-150"
            title="Kill process"
          >
            {isKilling ? (
              <Loader2 class="w-3 h-3 animate-spin" />
            ) : (
              <Skull class="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
