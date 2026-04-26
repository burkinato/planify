'use client';

import { useEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { FALLBACK_TEMPLATE_LAYOUTS, getDefaultTemplateState } from '@/lib/editor/templateLayouts';
import {
  sanitizeDebugEditorStatePayload,
  type DebugEditorStatePayload,
} from '@/lib/editor/sanitizeEditorState';
import { useAuthStore, type Profile } from '@/store/useAuthStore';
import { useEditorStore } from '@/store/useEditorStore';
import type { EditorElement, LayerDef } from '@/types/editor';

type DebugWindow = Window & {
  __konvaInvalidChildren?: unknown[];
};

const DEBUG_LAYER: LayerDef = {
  id: 'default',
  name: 'Debug Katmani',
  visible: true,
  locked: false,
  order: 0,
};

const DEBUG_PROFILE: Profile = {
  id: 'debug-user',
  full_name: 'Konva Debug',
  company: null,
  phone: null,
  gender: null,
  subscription_tier: 'free',
  subscription_status: 'active',
  marketing_consent: false,
};

const DEBUG_ELEMENTS: EditorElement[] = [
  {
    id: 'wall-1',
    type: 'wall',
    layerId: 'default',
    x: 0,
    y: 0,
    points: [80, 140, 540, 140],
    thickness: 16,
    wallStyle: 'hatch',
  },
  {
    id: 'wall-2',
    type: 'wall',
    layerId: 'default',
    x: 0,
    y: 0,
    points: [540, 140, 540, 420],
    thickness: 16,
    wallStyle: 'hatch',
  },
  {
    id: 'door-1',
    type: 'door',
    layerId: 'default',
    x: 0,
    y: 0,
    points: [220, 140, 320, 140],
    color: '#f59e0b',
  },
  {
    id: 'window-1',
    type: 'window',
    layerId: 'default',
    x: 0,
    y: 0,
    points: [540, 220, 540, 320],
  },
  {
    id: 'route-1',
    type: 'route',
    layerId: 'default',
    x: 0,
    y: 0,
    points: [160, 220, 430, 220, 430, 340],
    routeType: 'evacuation',
    color: '#22c55e',
    thickness: 8,
  },
  {
    id: 'symbol-1',
    type: 'symbol',
    layerId: 'default',
    x: 460,
    y: 360,
    symbolType: 'E001',
    width: 42,
    height: 42,
    color: '#16a34a',
  },
  {
    id: 'text-1',
    type: 'text',
    layerId: 'default',
    x: 220,
    y: 90,
    label: 'Konva Debug',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  {
    id: 'rect-1',
    type: 'rect',
    layerId: 'default',
    x: 320,
    y: 310,
    width: 120,
    height: 70,
    color: '#2563eb',
  },
  {
    id: 'stairs-1',
    type: 'stairs',
    layerId: 'default',
    x: 150,
    y: 340,
    width: 90,
    height: 120,
    stairsType: 'straight',
  },
  {
    id: 'elevator-1',
    type: 'elevator',
    layerId: 'default',
    x: 600,
    y: 260,
    width: 70,
    height: 70,
  },
  {
    id: 'column-1',
    type: 'column',
    layerId: 'default',
    x: 610,
    y: 130,
    width: 34,
    height: 34,
    columnShape: 'circle',
  },
];

export default function KonvaDebugPage() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const previousEditorStateRef = useRef<ReturnType<typeof useEditorStore.getState> | null>(null);
  const previousAuthStateRef = useRef<ReturnType<typeof useAuthStore.getState> | null>(null);
  const [capturedState, setCapturedState] = useState<DebugEditorStatePayload | null>(null);
  const [invalidChildInfo, setInvalidChildInfo] = useState<string>('waiting');

  useEffect(() => {
    let isCancelled = false;

    void fetch('/api/debug/editor-state')
      .then(async (response) => {
        if (!response.ok) return null;
        return sanitizeDebugEditorStatePayload(await response.json());
      })
      .then((payload) => {
        if (!isCancelled && payload) {
          setCapturedState(payload);
        }
      })
      .catch(() => {
        // Fall back to the hard-coded debug state.
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    previousEditorStateRef.current = useEditorStore.getState();
    previousAuthStateRef.current = useAuthStore.getState();

    const fallbackLayout =
      FALLBACK_TEMPLATE_LAYOUTS.find((layout) => layout.slug === 'iso-standard-landscape') ??
      FALLBACK_TEMPLATE_LAYOUTS[0];
    const templateLayout =
      FALLBACK_TEMPLATE_LAYOUTS.find((layout) => layout.id === capturedState?.templateLayoutId) ??
      FALLBACK_TEMPLATE_LAYOUTS.find((layout) => layout.slug === capturedState?.projectTemplate) ??
      fallbackLayout;
    const templateState =
      capturedState?.templateState && Object.keys(capturedState.templateState).length > 0
        ? capturedState.templateState
        : getDefaultTemplateState();
    const elements = capturedState?.elements ?? DEBUG_ELEMENTS;
    const layers = capturedState?.layers?.length ? capturedState.layers : [DEBUG_LAYER];
    const selectedIds = capturedState?.selectedIds ?? ['wall-1'];

    useAuthStore.setState({
      profile: DEBUG_PROFILE,
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
      error: null,
    });

    useEditorStore.setState({
      elements,
      layers,
      customSymbols: [],
      activeLayerId: layers[0]?.id || 'default',
      selectedIds,
      tool: 'select',
      zoom: 1,
      pan: { x: 0, y: 0 },
      gridVisible: true,
      selectedSymbol: null,
      scaleConfig: capturedState?.scaleConfig ?? { pixelsPerMeter: 50, unit: 'm' },
      editorTheme: 'classic',
      projectTemplate: capturedState?.projectTemplate || templateLayout.slug,
      templateLayoutId: capturedState?.templateLayoutId || templateLayout.id,
      activeTemplateLayout: templateLayout,
      pagePreset: templateLayout.page_preset,
      templateState,
      focusedRegionId: 'drawing',
      canUndo: false,
      canRedo: false,
      past: [],
      future: [],
    });

    const intervalId = window.setInterval(() => {
      const debugWindow = window as DebugWindow;
      const lastPayload =
        document.documentElement.dataset.konvaInvalidChild ??
        JSON.stringify(debugWindow.__konvaInvalidChildren ?? []);
      setInvalidChildInfo(lastPayload || 'none');
    }, 300);

    return () => {
      window.clearInterval(intervalId);

      if (previousEditorStateRef.current) {
        useEditorStore.setState(previousEditorStateRef.current);
      }

      if (previousAuthStateRef.current) {
        useAuthStore.setState(previousAuthStateRef.current);
      }
    };
  }, [capturedState]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-lg font-bold">Konva Debug Surface</h1>
        <p className="mt-1 text-sm text-slate-600">
          This page renders the real <code>EditorCanvas</code> tree without auth gates.
        </p>
        {capturedState && (
          <p className="mt-2 text-xs text-slate-500">
            Loaded last captured editor state from <code>{capturedState.location ?? 'unknown'}</code>
          </p>
        )}
        <pre className="mt-3 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-300">
          {invalidChildInfo}
        </pre>
      </div>

      <div className="h-[calc(100vh-144px)]">
        <EditorCanvas
          isPreview={false}
          mobileMenu={null}
          setMobileMenu={() => {}}
          stageRef={stageRef}
          setContainerNode={() => {}}
        />
      </div>
    </main>
  );
}
