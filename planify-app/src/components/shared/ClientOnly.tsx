'use client';

import { useSyncExternalStore } from 'react';

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const hasMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!hasMounted) return null;

  return <>{children}</>;
}
