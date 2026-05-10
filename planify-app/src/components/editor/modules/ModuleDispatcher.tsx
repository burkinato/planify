import React from 'react';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

import { HeaderModule } from './HeaderModule';
import { EmergencyCallModule } from './EmergencyCallModule';
import { EvacuationInstructionsModule } from './EvacuationInstructionsModule';
import { FireInstructionsModule } from './FireInstructionsModule';
import { LegendModule } from './LegendModule';
import { AssemblyMapModule } from './AssemblyMapModule';
import { ApprovalRevisionModule } from './ApprovalRevisionModule';
import { EmergencyTeamsModule } from './EmergencyTeamsModule';
import { HazardUtilitiesModule } from './HazardUtilitiesModule';
import { AccessibilityRefugeModule } from './AccessibilityRefugeModule';
import { FireEquipmentModule } from './FireEquipmentModule';
import { QrDocumentInfoModule } from './QrDocumentInfoModule';
import { NotesModule } from './NotesModule';
import { GenericModule } from './GenericModule';

/* ────────────────────────────────────────────────────────────────────────
 *  ModuleDispatcher
 *  Region type ve id'ye bakarak doğru modül bileşenini render eder.
 *  Monolitik ReadOnlyRegion yerine kullanılır.
 * ──────────────────────────────────────────────────────────────────────── */

interface ModuleDispatcherProps {
  region: TemplateRegion;
  content: TemplateRegionState;
  accent?: string;
  compact?: boolean;
}

export function ModuleDispatcher({ region, content, accent, compact }: ModuleDispatcherProps) {
  const regionId = (region.id || '').toLowerCase();

  // Header
  if (region.type === 'header') {
    return <HeaderModule region={region} content={content} accent={accent} compact={compact} />;
  }

  // Emergency call
  if (region.type === 'emergency') {
    return <EmergencyCallModule region={region} content={content} compact={compact} />;
  }

  // Legend
  if (region.type === 'legend') {
    return <LegendModule region={region} content={content} compact={compact} />;
  }

  // Assembly / toplanma
  if (region.type === 'assembly' || region.type === 'media') {
    return <AssemblyMapModule region={region} content={content} compact={compact} />;
  }

  // Approval / revision
  if (region.type === 'approval') {
    return <ApprovalRevisionModule region={region} content={content} compact={compact} />;
  }

  // Team
  if (region.type === 'team') {
    return <EmergencyTeamsModule region={region} content={content} compact={compact} />;
  }

  // Instructions — determine fire vs evacuation
  if (region.type === 'instruction') {
    if (regionId.includes('fire') || regionId.includes('yangin') || regionId.includes('fireinstruction')) {
      return <FireInstructionsModule region={region} content={content} compact={compact} />;
    }
    return <EvacuationInstructionsModule region={region} content={content} compact={compact} />;
  }

  // Info type — disambiguate by id
  if (region.type === 'info') {
    if (regionId.includes('hazard') || regionId.includes('risk') || regionId.includes('utility')) {
      return <HazardUtilitiesModule region={region} content={content} compact={compact} />;
    }
    if (regionId.includes('access') || regionId.includes('refuge') || regionId.includes('erişim') || regionId.includes('accessibility')) {
      return <AccessibilityRefugeModule region={region} content={content} compact={compact} />;
    }
    if (regionId.includes('equipment') || regionId.includes('ekipman') || regionId.includes('fire')) {
      return <FireEquipmentModule region={region} content={content} compact={compact} />;
    }
    if (regionId.includes('qr') || regionId.includes('belge') || regionId.includes('document')) {
      return <QrDocumentInfoModule region={region} content={content} compact={compact} />;
    }
    if (regionId.includes('not') || regionId.includes('note')) {
      return <NotesModule region={region} content={content} compact={compact} />;
    }
  }

  // Fallback
  return <GenericModule region={region} content={content} compact={compact} />;
}
