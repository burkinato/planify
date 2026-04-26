'use client';

import { useEffect } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAdminAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <>{children}</>;
}
