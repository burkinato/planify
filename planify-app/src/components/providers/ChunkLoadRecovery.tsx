'use client';

import { useEffect } from 'react';

const RECOVERY_KEY = 'KolayTahliye:chunk-load-recovery';

function isChunkLoadIssue(value: unknown) {
  if (!value) {
    return false;
  }

  const message = value instanceof Error ? value.message : String(value);
  return (
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to load chunk') ||
    message.includes('/_next/static/chunks/')
  );
}

function reloadOnce() {
  const key = `${RECOVERY_KEY}:${window.location.pathname}`;

  if (sessionStorage.getItem(key) === '1') {
    return;
  }

  sessionStorage.setItem(key, '1');
  window.location.reload();
}

export function ChunkLoadRecovery() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLScriptElement &&
        target.src.includes('/_next/static/chunks/')
      ) {
        reloadOnce();
        return;
      }

      if (isChunkLoadIssue(event.error) || isChunkLoadIssue(event.message)) {
        reloadOnce();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadIssue(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
