import type { Project } from '@/store/useProjectStore';

export type AuditStatus = 'draft' | 'missing' | 'ready' | 'exported';

export interface AuditCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface ProjectAudit {
  checks: AuditCheck[];
  missing: string[];
  score: number;
  status: AuditStatus;
  statusLabel: string;
  statusTone: 'slate' | 'amber' | 'emerald' | 'blue';
}

type CanvasData = {
  elements?: Array<{
    type?: string;
    symbolType?: string;
    routeType?: string;
  }>;
  templateLayoutId?: string | null;
  projectTemplate?: string | null;
};

function getCanvasData(project: Pick<Project, 'canvas_data'>): CanvasData {
  return typeof project.canvas_data === 'object' && project.canvas_data
    ? project.canvas_data as CanvasData
    : {};
}

export function analyzeProjectCompliance(project: Pick<Project, 'canvas_data' | 'template_layout_id' | 'page_preset' | 'last_exported_at'>): ProjectAudit {
  const canvasData = getCanvasData(project);
  const elements = Array.isArray(canvasData.elements) ? canvasData.elements : [];
  const hasContent = elements.length > 0;
  const hasHere = elements.some((el) => el.type === 'symbol' && ['E004', 'here'].includes(el.symbolType || ''));
  const hasEvacuationRoute = elements.some((el) => el.type === 'route' && el.routeType === 'evacuation');
  const hasAssembly = elements.some((el) => el.type === 'symbol' && ['E007', 'assembly'].includes(el.symbolType || ''));
  const hasFireEquipment = elements.some((el) => el.type === 'symbol' && (el.symbolType || '').startsWith('F'));
  const hasTemplate = Boolean(
    project.template_layout_id ||
    canvasData.templateLayoutId ||
    (canvasData.projectTemplate && canvasData.projectTemplate !== 'blank')
  );

  const checks: AuditCheck[] = [
    { id: 'here', label: 'Buradasınız işareti', passed: hasHere },
    { id: 'route', label: 'Tahliye rotası', passed: hasEvacuationRoute },
    { id: 'assembly', label: 'Toplanma noktası', passed: hasAssembly },
    { id: 'fire', label: 'Yangın ekipmanı sembolü', passed: hasFireEquipment },
    { id: 'template', label: 'Antet / şablon bilgisi', passed: hasTemplate },
  ];
  const missing = checks.filter((check) => !check.passed).map((check) => check.label);
  const score = hasContent
    ? Math.round((checks.filter((check) => check.passed).length / checks.length) * 100)
    : 0;

  let status: AuditStatus = 'draft';
  if (hasContent && missing.length > 0) status = 'missing';
  if (hasContent && missing.length === 0) status = 'ready';
  if (status === 'ready' && project.last_exported_at) status = 'exported';

  const statusMeta: Record<AuditStatus, { label: string; tone: ProjectAudit['statusTone'] }> = {
    draft: { label: 'Taslak', tone: 'slate' },
    missing: { label: 'Eksik', tone: 'amber' },
    ready: { label: 'Denetime Hazır', tone: 'emerald' },
    exported: { label: 'Çıktı Alındı', tone: 'blue' },
  };

  return {
    checks,
    missing,
    score,
    status,
    statusLabel: statusMeta[status].label,
    statusTone: statusMeta[status].tone,
  };
}

export function formatPortalDate(date: string | null | undefined) {
  if (!date) return 'Henüz yok';

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
