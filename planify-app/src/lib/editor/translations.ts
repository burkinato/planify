export const TRANSLATIONS = {
  tr: {
    modules: {
      Header: { title: 'ACİL DURUM TAHLİYE PLANI', sub: 'Emergency Evacuation Plan' },
      EmergencyCall: { title: 'ACİL YARDIM NUMARASI', body: '112 - ACİL ÇAĞRI MERKEZİ' },
      EvacuationInstructions: { title: 'ACİL DURUM TALİMATI' },
      FireInstructions: { title: 'YANGIN TALİMATI' },
      Legend: { title: 'SEMBOLLER DİZİNİ' },
      AssemblyMap: { title: 'TOPLANMA ALANI' },
      ApprovalRevision: { title: 'REVİZYON VE ONAY' },
      EmergencyTeams: { title: 'ACİL DURUM EKİBİ' },
      HazardUtilities: { title: 'RİSK VE TESİSAT' },
      AccessibilityRefuge: { title: 'ERİŞİLEBİLİRLİK' },
      FireEquipmentInventory: { title: 'YANGIN EKİPMANI' },
      QrDocumentInfo: { title: 'DOKÜMAN BİLGİSİ' },
      Notes: { title: 'NOTLAR' },
    },
    ui: {
      edit: 'DÜZENLE',
      preview: 'ÖNİZLE',
      export: 'DIŞA AKTAR',
      save: 'KAYDET',
      language: 'Dil',
      tools: 'Araçlar',
      properties: 'Özellikler',
      layers: 'Katmanlar',
      symbols: 'Semboller',
      templates: 'Şablonlar',
    }
  },
  en: {
    modules: {
      Header: { title: 'EMERGENCY EVACUATION PLAN', sub: 'Acil Durum Tahliye Planı' },
      EmergencyCall: { title: 'EMERGENCY CALL NUMBERS', body: '112 - EMERGENCY CALL CENTER' },
      EvacuationInstructions: { title: 'EVACUATION INSTRUCTIONS' },
      FireInstructions: { title: 'FIRE INSTRUCTIONS' },
      Legend: { title: 'LEGEND / SYMBOLS' },
      AssemblyMap: { title: 'ASSEMBLY AREA' },
      ApprovalRevision: { title: 'APPROVAL & REVISION' },
      EmergencyTeams: { title: 'EMERGENCY TEAMS' },
      HazardUtilities: { title: 'HAZARD & UTILITIES' },
      AccessibilityRefuge: { title: 'ACCESSIBILITY' },
      FireEquipmentInventory: { title: 'FIRE EQUIPMENT' },
      QrDocumentInfo: { title: 'DOCUMENT INFO' },
      Notes: { title: 'NOTES' },
    },
    ui: {
      edit: 'EDIT',
      preview: 'PREVIEW',
      export: 'EXPORT',
      save: 'SAVE',
      language: 'Language',
      tools: 'Tools',
      properties: 'Properties',
      layers: 'Layers',
      symbols: 'Symbols',
      templates: 'Templates',
    }
  }
};

export type Language = keyof typeof TRANSLATIONS;
