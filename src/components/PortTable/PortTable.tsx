import { useRef, useState, useEffect, useCallback } from 'preact/hooks';
import { TableHeader } from './TableHeader';
import { PortRow } from './PortRow';
import { Loader2, Inbox, Radio } from 'lucide-preact';
import type { PortInfo, SortColumn, SortDirection, KillResult } from '../../store/types';

interface PortTableProps {
  ports: PortInfo[];
  onKill: (pid: number, elevated: boolean) => Promise<KillResult>;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  isLoading: boolean;
}

const ROW_HEIGHT = 44;
const OVERSCAN = 5;

export function PortTable({
  ports,
  onKill,
  sortColumn,
  sortDirection,
  onSort,
  isLoading,
}: PortTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Update container height on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Calculate visible range
  const totalHeight = ports.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    ports.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
  );

  const visiblePorts = ports.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  if (isLoading && ports.length === 0) {
    return (
      <div class="table-container h-full flex flex-col">
        <div class="empty-state flex-1">
          <div class="relative">
            <Loader2 class="empty-state-icon animate-spin text-neon-cyan" />
            <div class="absolute inset-0 blur-xl bg-neon-cyan/20 animate-pulse" />
          </div>
          <p class="empty-state-title">Scanning Network</p>
          <p class="empty-state-description">
            Discovering active ports and processes...
          </p>
        </div>
      </div>
    );
  }

  if (ports.length === 0) {
    return (
      <div class="table-container h-full flex flex-col">
        <div class="empty-state flex-1">
          <div class="relative mb-2">
            <Inbox class="empty-state-icon" />
          </div>
          <p class="empty-state-title">No Ports Detected</p>
          <p class="empty-state-description">
            Try adjusting your filters or scanning a specific port range
          </p>
          <div class="mt-6 flex items-center gap-2 text-xxs text-cyber-muted">
            <Radio class="w-3 h-3" />
            <span class="font-mono">AWAITING SIGNAL</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="table-container h-full flex flex-col">
      <TableHeader
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
      />

      <div
        ref={containerRef}
        class="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: `${offsetY}px`,
              left: 0,
              right: 0,
            }}
          >
            {visiblePorts.map((port) => (
              <PortRow
                key={`${port.pid}-${port.port}-${port.protocol}`}
                port={port}
                onKill={onKill}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay for refresh */}
      {isLoading && ports.length > 0 && (
        <div class="absolute top-0 right-0 m-4">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-surface/90 border border-cyber-border/50 backdrop-blur-sm">
            <Loader2 class="w-3 h-3 animate-spin text-neon-cyan" />
            <span class="text-xxs font-mono text-cyber-muted">REFRESHING</span>
          </div>
        </div>
      )}
    </div>
  );
}
