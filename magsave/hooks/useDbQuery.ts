import { useCallback, useEffect, useState } from 'react';

import { useUIStore } from '@/stores/ui.store';

/**
 * Ejecuta una query de SQLite y se refresca automáticamente cuando
 * cambia `dataVersion` (es decir, después de cualquier escritura).
 */
export function useDbQuery<T>(
  queryFn: () => Promise<T>,
  deps: readonly unknown[] = [],
): { data: T | null; loading: boolean; refetch: () => void } {
  const dataVersion = useUIStore((s) => s.dataVersion);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await queryFn();
        if (!cancelled) setData(result);
      } catch (error) {
        console.error('Error leyendo la base de datos:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion, tick, ...deps]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, refetch };
}
