'use client';

import { cn } from '@/lib/utils';
import {
  SegmentedControl, NumericInput, ColorSelector, InspectorSection, PropertyLabel, SliderControl
} from './InspectorControls';
import { useEditorStore, useShallow } from '@/store/useEditorStore';
import type { EditorTool, StairType, WallToolOptions, DoorToolOptions, WindowToolOptions, StairsToolOptions, ElevatorToolOptions, ColumnToolOptions, TextToolOptions, RouteToolOptions } from '@/types/editor';

// --- Stair Previews ---
function StraightPreview() {
  return (
    <svg viewBox="0 0 80 100" className="w-full h-full" fill="none">
      <rect x="8" y="6" width="64" height="88" rx="2" stroke="#1e293b" strokeWidth="1.5"/>
      {Array.from({length: 10}).map((_, i) => (
        <line key={i} x1="8" y1={16 + i * 7.5} x2="72" y2={16 + i * 7.5} stroke="#475569" strokeWidth="0.8"/>
      ))}
      <line x1="40" y1="88" x2="40" y2="18" stroke="#1e293b" strokeWidth="1.2"/>
      <polygon points="40,10 36,20 44,20" fill="#1e293b"/>
      <text x="40" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">DÜZ</text>
    </svg>
  );
}

function LShapePreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect x="5" y="5" width="90" height="90" rx="2" stroke="#cbd5e1" strokeWidth="1"/>
      {Array.from({length: 6}).map((_, i) => (
        <line key={i} x1="12" y1={48 + i * 7} x2="38" y2={48 + i * 7} stroke="#475569" strokeWidth="0.8"/>
      ))}
      <line x1="25" y1="88" x2="25" y2="48" stroke="#1e293b" strokeWidth="1"/>
      <rect x="12" y="28" width="40" height="22" rx="1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8"/>
      {Array.from({length: 5}).map((_, i) => (
        <line key={i} x1={56 + i * 7} y1="14" x2={56 + i * 7} y2="50" stroke="#475569" strokeWidth="0.8"/>
      ))}
      <line x1="52" y1="32" x2="88" y2="32" stroke="#1e293b" strokeWidth="1"/>
      <polygon points="88,28 88,36 95,32" fill="#1e293b"/>
      <text x="50" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">L</text>
    </svg>
  );
}

function SpiralPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <circle cx="50" cy="50" r="44" stroke="#1e293b" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="10" stroke="#1e293b" strokeWidth="1.2"/>
      <circle cx="50" cy="50" r="2" fill="#1e293b"/>
      {Array.from({length: 14}).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
        return (
          <line key={i}
            x1={50 + Math.cos(angle) * 10}
            y1={50 + Math.sin(angle) * 10}
            x2={50 + Math.cos(angle) * 44}
            y2={50 + Math.sin(angle) * 44}
            stroke="#475569" strokeWidth="0.7"
          />
        );
      })}
      <path d="M 62,38 Q 75,30 70,50" stroke="#1e293b" strokeWidth="1.2" fill="none"/>
      <text x="50" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">SPIRAL</text>
    </svg>
  );
}

function CorePreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect x="5" y="5" width="90" height="90" rx="2" stroke="#1e293b" strokeWidth="1.5"/>
      {Array.from({length: 6}).map((_, i) => (
        <g key={i}>
          <line x1="18" y1={30 + i * 8} x2="28" y2={30 + i * 8} stroke="#475569" strokeWidth="0.8"/>
          <line x1="18" y1={30 + i * 8} x2="15" y2={34 + i * 8} stroke="#475569" strokeWidth="0.8"/>
        </g>
      ))}
      <line x1="22" y1="82" x2="22" y2="22" stroke="#1e293b" strokeWidth="1.2"/>
      <polygon points="22,16 18,26 26,26" fill="#1e293b"/>
      {Array.from({length: 6}).map((_, i) => (
        <g key={i}>
          <line x1="72" y1={22 + i * 8} x2="82" y2={22 + i * 8} stroke="#475569" strokeWidth="0.8"/>
          <line x1="82" y1={22 + i * 8} x2="85" y2={26 + i * 8} stroke="#475569" strokeWidth="0.8"/>
        </g>
      ))}
      <line x1="78" y1="22" x2="78" y2="82" stroke="#1e293b" strokeWidth="1.2"/>
      <polygon points="78,88 74,78 82,78" fill="#1e293b"/>
      <rect x="34" y="30" width="32" height="40" rx="1" fill="transparent" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,2"/>
      <text x="50" y="54" textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="600">BOŞLUK</text>
      <text x="50" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">CORE</text>
    </svg>
  );
}

const STAIR_TYPES: { id: StairType; name: string; preview: React.ReactNode }[] = [
  { id: 'straight', name: 'Düz', preview: <StraightPreview /> },
  { id: 'l-shape', name: 'L', preview: <LShapePreview /> },
  { id: 'spiral', name: 'Spiral', preview: <SpiralPreview /> },
  { id: 'core', name: 'Çekirdek', preview: <CorePreview /> },
];

// --- Wall Inspector ---
export function WallInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.wall as WallToolOptions;

  return (
    <div className="space-y-6">
      <InspectorSection title="Duvar Stili" defaultOpen>
        <PropertyLabel label="Tarama">
          <SegmentedControl
            value={opts.style}
            onChange={(v) => updateToolOptions('wall', { style: v as WallToolOptions['style'] })}
            options={[
              { value: 'hatch', label: 'Taralı' },
              { value: 'solid', label: 'Dolu' },
              { value: 'double', label: 'Çift' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Duvar Mühendisliği" defaultOpen>
        <PropertyLabel label="Kalınlık (cm)">
          <div className="grid grid-cols-4 gap-2">
            {[10, 12, 16, 20].map(t => (
              <button
                key={t}
                onClick={() => updateToolOptions('wall', { thickness: t })}
                className={cn(
                  "h-10 rounded-xl text-[10px] font-black border transition-all duration-300",
                  opts.thickness === t
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                    : "bg-white border-slate-200/60 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </PropertyLabel>
      </InspectorSection>
    </div>
  );
}

// --- Door Inspector ---
export function DoorInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.door as DoorToolOptions;

  return (
    <div className="space-y-6">
      <InspectorSection title="Kapı Tipi" defaultOpen>
        <PropertyLabel label="Kapı Türü">
          <SegmentedControl
            value={opts.doorType}
            onChange={(v) => updateToolOptions('door', { doorType: v as DoorToolOptions['doorType'] })}
            options={[
              { value: 'single', label: 'Tek Kanat' },
              { value: 'double', label: 'Çift Kanat' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Kapı Ayarları" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <PropertyLabel label="Genişlik (cm)">
            <NumericInput
              value={opts.width}
              onChange={(v) => updateToolOptions('door', { width: v })}
              min={60}
              max={200}
            />
          </PropertyLabel>
          <PropertyLabel label="Kanat Yönü">
            <SegmentedControl
              value={opts.swingDirection}
              onChange={(v) => updateToolOptions('door', { swingDirection: v as DoorToolOptions['swingDirection'] })}
              options={[
                { value: 'left', label: 'Sol' },
                { value: 'right', label: 'Sağ' },
                { value: 'double', label: 'Çift' },
              ]}
            />
          </PropertyLabel>
        </div>
      </InspectorSection>
    </div>
  );
}

// --- Window Inspector ---
export function WindowInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.window as WindowToolOptions;

  return (
    <div className="space-y-6">
      <InspectorSection title="Pencere Ayarları" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <PropertyLabel label="Genişlik (cm)">
            <NumericInput
              value={opts.width}
              onChange={(v) => updateToolOptions('window', { width: v })}
              min={50}
              max={300}
            />
          </PropertyLabel>
          <PropertyLabel label="Yükseklik (cm)">
            <NumericInput
              value={opts.height}
              onChange={(v) => updateToolOptions('window', { height: v })}
              min={5}
              max={30}
            />
          </PropertyLabel>
        </div>
        <PropertyLabel label="Kanat Sayısı">
          <SegmentedControl
            value={opts.panes}
            onChange={(v) => updateToolOptions('window', { panes: v as number })}
            options={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>
    </div>
  );
}

// --- Stairs Inspector ---
export function StairsInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.stairs as StairsToolOptions;

  return (
    <div className="space-y-6">
      <InspectorSection title="Merdiven Tipi" defaultOpen>
        <div className="grid grid-cols-4 gap-2">
          {STAIR_TYPES.map(st => (
            <button
              key={st.id}
              onClick={() => updateToolOptions('stairs', { stairsType: st.id })}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                opts.stairsType === st.id
                  ? "border-accent-emerald bg-accent-emerald/10 text-accent-emerald"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="w-8 h-8">{st.preview}</div>
              <span className="text-[8px] font-bold">{st.name}</span>
            </button>
          ))}
        </div>
      </InspectorSection>

      <InspectorSection title="Boyutlar" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <PropertyLabel label="Genişlik (cm)">
            <NumericInput
              value={opts.width}
              onChange={(v) => updateToolOptions('stairs', { width: v })}
              min={80}
              max={200}
            />
          </PropertyLabel>
          <PropertyLabel label="Yükseklik (cm)">
            <NumericInput
              value={opts.height}
              onChange={(v) => updateToolOptions('stairs', { height: v })}
              min={100}
              max={300}
            />
          </PropertyLabel>
        </div>
      </InspectorSection>
    </div>
  );
}

// --- Elevator Inspector ---
export function ElevatorInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.elevator as ElevatorToolOptions;

  return (
    <div className="space-y-6">
      <InspectorSection title="Asansör Tipi" defaultOpen>
        <PropertyLabel label="Asansör Türü">
          <SegmentedControl
            value={opts.elevatorType}
            onChange={(v) => updateToolOptions('elevator', { elevatorType: v as ElevatorToolOptions['elevatorType'] })}
            options={[
              { value: 'passenger', label: 'Yolcu' },
              { value: 'freight', label: 'Yük' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Boyutlar" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <PropertyLabel label="Genişlik (cm)">
            <NumericInput
              value={opts.width}
              onChange={(v) => updateToolOptions('elevator', { width: v })}
              min={100}
              max={250}
            />
          </PropertyLabel>
          <PropertyLabel label="Yükseklik (cm)">
            <NumericInput
              value={opts.height}
              onChange={(v) => updateToolOptions('elevator', { height: v })}
              min={100}
              max={250}
            />
          </PropertyLabel>
        </div>
      </InspectorSection>
    </div>
  );
}

// --- Column Inspector ---
export function ColumnInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.column as ColumnToolOptions;

  return (
    <div className="space-y-6">
      <InspectorSection title="Kolon Şekli" defaultOpen>
        <PropertyLabel label="Şekil">
          <SegmentedControl
            value={opts.shape}
            onChange={(v) => updateToolOptions('column', { shape: v as ColumnToolOptions['shape'] })}
            options={[
              { value: 'square', label: 'Kare' },
              { value: 'round', label: 'Daire' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Boyut" defaultOpen>
        <PropertyLabel label="Boyut (cm)">
          <div className="grid grid-cols-4 gap-2">
            {[30, 40, 50, 60].map(s => (
              <button
                key={s}
                onClick={() => updateToolOptions('column', { size: s })}
                className={cn(
                  "h-10 rounded-xl text-[10px] font-black border transition-all duration-300",
                  opts.size === s
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                    : "bg-white border-slate-200/60 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </PropertyLabel>
      </InspectorSection>
    </div>
  );
}

// --- Text Inspector ---
const ISO_STANDARDS = {
  SAFETY_GREEN: '#008F4C',
  FIRE_RED: '#E81123',
  WARNING_YELLOW: '#FFD700',
  MANDATORY_BLUE: '#00539C',
  NAVY: '#050b16',
  WHITE: '#ffffff',
};

export function TextInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.text as TextToolOptions;

  const SIZE_PRESETS = [9, 11, 13, 16, 20, 24, 32];

  return (
    <div className="space-y-6">
      <InspectorSection title="Yazı Tipi" defaultOpen>
        <PropertyLabel label="Ağırlık">
          <SegmentedControl
            value={opts.fontWeight}
            onChange={(v) => updateToolOptions('text', { fontWeight: v as TextToolOptions['fontWeight'] })}
            options={[
              { value: 'normal', label: 'N' },
              { value: 'bold', label: 'B' },
              { value: 'black', label: 'BL' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Boyut" defaultOpen>
        <div className="grid grid-cols-5 gap-1.5">
          {SIZE_PRESETS.map(s => (
            <button
              key={s}
              onClick={() => updateToolOptions('text', { fontSize: s })}
              className={cn(
                "h-8 rounded-lg text-[10px] font-black border transition-all duration-300",
                opts.fontSize === s
                  ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                  : "bg-white/80 border-slate-200/60 text-slate-500 hover:border-slate-400 hover:bg-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </InspectorSection>

      <InspectorSection title="Renk" defaultOpen>
        <PropertyLabel label="Yazı Rengi">
          <ColorSelector
            value={opts.color}
            colors={Object.values(ISO_STANDARDS)}
            onChange={(c) => updateToolOptions('text', { color: c })}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Hizalama" defaultOpen>
        <PropertyLabel label="Metin Hizası">
          <SegmentedControl
            value={opts.textAlign}
            onChange={(v) => updateToolOptions('text', { textAlign: v as TextToolOptions['textAlign'] })}
            options={[
              { value: 'left', label: 'Sol' },
              { value: 'center', label: 'Orta' },
              { value: 'right', label: 'Sağ' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>
    </div>
  );
}

// --- Route Inspector ---
export function RouteInspector({ routeType }: { routeType: 'evacuation-route' | 'rescue-route' }) {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions[routeType] as RouteToolOptions;
  const isEvacuation = routeType === 'evacuation-route';

  return (
    <div className="space-y-6">
      <InspectorSection title={isEvacuation ? 'Tahliye Rotası' : 'Kurtarma Rotası'} defaultOpen>
        <PropertyLabel label="Çizgi Stili">
          <SegmentedControl
            value={opts.lineStyle}
            onChange={(v) => updateToolOptions(routeType, { lineStyle: v as RouteToolOptions['lineStyle'] })}
            options={[
              { value: 'solid', label: 'Düz' },
              { value: 'dashed', label: 'Kesikli' },
            ]}
          />
        </PropertyLabel>
      </InspectorSection>

      <InspectorSection title="Çizgi Ayarları" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <PropertyLabel label="Genişlik">
            <SliderControl
              value={opts.width}
              onChange={(v) => updateToolOptions(routeType, { width: v })}
              min={1}
              max={10}
              unit="px"
            />
          </PropertyLabel>
          <PropertyLabel label="Renk">
            <ColorSelector
              value={opts.color}
              colors={Object.values(ISO_STANDARDS)}
              onChange={(c) => updateToolOptions(routeType, { color: c })}
            />
          </PropertyLabel>
        </div>
      </InspectorSection>
    </div>
  );
}

// --- Rect Inspector ---
export function RectInspector() {
  const { toolOptions, updateToolOptions } = useEditorStore(useShallow(s => ({
    toolOptions: s.toolOptions, updateToolOptions: s.updateToolOptions
  })));
  const opts = toolOptions.rect;

  return (
    <div className="space-y-6">
      <InspectorSection title="Dikdörtgen Ayarları" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <PropertyLabel label="Genişlik (cm)">
            <NumericInput
              value={opts.width}
              onChange={(v) => updateToolOptions('rect', { width: v })}
              min={10}
              max={500}
            />
          </PropertyLabel>
          <PropertyLabel label="Yükseklik (cm)">
            <NumericInput
              value={opts.height}
              onChange={(v) => updateToolOptions('rect', { height: v })}
              min={10}
              max={500}
            />
          </PropertyLabel>
        </div>
      </InspectorSection>

      <InspectorSection title="Renk" defaultOpen>
        <PropertyLabel label="Dolgu Rengi">
          <ColorSelector
            value={opts.color}
            colors={Object.values(ISO_STANDARDS)}
            onChange={(c) => updateToolOptions('rect', { color: c })}
          />
        </PropertyLabel>
      </InspectorSection>
    </div>
  );
}

// --- Main ToolInspector (switches based on tool) ---
export function ToolInspector() {
  const tool = useEditorStore(s => s.tool);

  if (tool === 'select' || tool === 'symbol' || tool === 'eraser' || tool === 'scale') return null;

  const toolNames: Record<string, string> = {
    'wall': 'Duvar Aracı',
    'door': 'Kapı Aracı',
    'window': 'Pencere Aracı',
    'stairs': 'Merdiven Aracı',
    'elevator': 'Asansör Aracı',
    'column': 'Kolon Aracı',
    'text': 'Metin Aracı',
    'evacuation-route': 'Tahliye Rotası',
    'rescue-route': 'Kurtarma Rotası',
    'rect': 'Dikdörtgen Aracı',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
          <span className="text-[10px] font-black text-emerald-400 uppercase">Araç</span>
        </div>
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-white">
            {toolNames[tool] || tool}
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Araç Ayarları</p>
        </div>
      </div>

      {tool === 'wall' && <WallInspector />}
      {tool === 'door' && <DoorInspector />}
      {tool === 'window' && <WindowInspector />}
      {tool === 'stairs' && <StairsInspector />}
      {tool === 'elevator' && <ElevatorInspector />}
      {tool === 'column' && <ColumnInspector />}
      {tool === 'text' && <TextInspector />}
      {tool === 'evacuation-route' && <RouteInspector routeType="evacuation-route" />}
      {tool === 'rescue-route' && <RouteInspector routeType="rescue-route" />}
      {tool === 'rect' && <RectInspector />}
    </div>
  );
}
