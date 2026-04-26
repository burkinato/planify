'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

export class EditorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[EditorErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen h-full flex-col items-center justify-center bg-slate-50 px-6">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-100 bg-red-50">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Bir Sorun Olustu</h1>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Editor beklenmedik bir hatayla karsilasti. Calismaniz otomatik olarak kaydedilmis olabilir.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600">
                  Teknik detay
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded-xl bg-slate-100 p-3 font-mono text-xs whitespace-pre-wrap text-slate-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
              >
                <RefreshCw className="h-4 w-4" /> Editoru Yeniden Baslat
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <Home className="h-4 w-4" /> Dashboard&apos;a Don
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
