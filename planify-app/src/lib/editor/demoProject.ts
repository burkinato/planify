import { v4 as uuidv4 } from 'uuid';
import { EditorElement, LayerDef } from '@/types/editor';

export const getDemoProject = () => {
  const defaultLayerId = 'default';
  
  const elements: EditorElement[] = [
    // Simple room walls
    {
      id: uuidv4(), type: 'wall', layerId: defaultLayerId, x: 100, y: 100,
      points: [0, 0, 400, 0, 400, 300, 0, 300, 0, 0],
      thickness: 12, wallStyle: 'hatch', color: '#050b16'
    },
    // Door
    {
      id: uuidv4(), type: 'door', layerId: defaultLayerId, x: 300, y: 300,
      width: 80, rotation: 0, doorSwing: 'right'
    },
    // Windows
    {
      id: uuidv4(), type: 'window', layerId: defaultLayerId, x: 150, y: 100,
      width: 100, rotation: 0
    },
    // "You Are Here" symbol
    {
      id: uuidv4(), type: 'symbol', layerId: defaultLayerId, x: 250, y: 200,
      symbolType: 'E004' // Buradasınız
    },
    // Fire Extinguisher
    {
      id: uuidv4(), type: 'symbol', layerId: defaultLayerId, x: 120, y: 250,
      symbolType: 'F001'
    },
    // Evacuation Route
    {
      id: uuidv4(), type: 'route', layerId: defaultLayerId, x: 0, y: 0,
      points: [250, 200, 300, 200, 300, 300, 350, 350],
      routeType: 'evacuation', color: '#008F4C', thickness: 4
    }
  ];

  const layers: LayerDef[] = [
    { id: defaultLayerId, name: 'Ana Katman', visible: true, locked: false, order: 0 }
  ];

  return {
    elements,
    layers,
    projectTemplate: 'A3_Horizontal_Professional',
    templateLayoutId: 'A3_Horizontal_Professional',
    templateState: {
      'header-1': { title: 'DEMO FABRİKA TAHALİYE PLANI', body: 'ÖRNEK KAT YERLEŞİMİ' },
      'emergency-1': { title: 'ACİL DURUM TELEFONLARI', body: 'İtfaiye: 110\nAmbulans: 112\nPolis: 155' }
    }
  };
};
