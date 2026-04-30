/**
 * Samet (Strategist) — Editor Store Simple Tests
 * Core functionality tests after performance optimization
 */

import { useEditorStore } from '@/store/useEditorStore';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Editor Store - Core Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    const state = useEditorStore.getState();
    state.clearAll();
  });

  describe('Element Operations', () => {
    it('should add element with unique id', () => {
      const { addElement, elements } = useEditorStore.getState();

      addElement({ type: 'wall', x: 100, y: 100, width: 200, height: 10 });

      const state = useEditorStore.getState();
      expect(state.elements.length).toBe(1);
      expect(state.elements[0].type).toBe('wall');
      expect(state.elements[0].id).toBe('test-uuid-1234');
    });

    it('should update element using Map (P1 Fix)', () => {
      const { addElement, updateElement } = useEditorStore.getState();

      addElement({ type: 'wall', x: 100, y: 100 });
      const elementId = useEditorStore.getState().elements[0].id;

      updateElement(elementId, { x: 150, width: 300 });

      const updated = useEditorStore.getState().elements[0];
      expect(updated.x).toBe(150);
      expect(updated.width).toBe(300);
    });

    it('should remove elements by ids', () => {
      const { addElement, removeElements } = useEditorStore.getState();

      addElement({ type: 'wall' });
      addElement({ type: 'symbol' });
      const ids = useEditorStore.getState().elements.map(e => e.id);

      removeElements(ids);

      const state = useEditorStore.getState();
      expect(state.elements.length).toBe(0);
    });
  });

  describe('Layer Operations', () => {
    it('should add new layer', () => {
      const { addLayer, layers } = useEditorStore.getState();

      addLayer('New Layer');

      const state = useEditorStore.getState();
      expect(state.layers.length).toBe(2); // default + new
      expect(state.layers[1].name).toBe('New Layer');
    });

    it('should toggle layer visibility', () => {
      const { addLayer, toggleLayerVisibility } = useEditorStore.getState();

      addLayer('Test Layer');
      const layerId = useEditorStore.getState().layers[1].id;

      toggleLayerVisibility(layerId);

      const layer = useEditorStore.getState().layers.find(l => l.id === layerId);
      expect(layer?.visible).toBe(false);
    });
  });

  describe('Undo/Redo', () => {
    it('should enable undo after element addition', () => {
      // Reset store first
      useEditorStore.getState().clearAll();
      const initialState = useEditorStore.getState();
      expect(initialState.canUndo).toBe(false);

      initialState.addElement({ type: 'wall' });

      const state = useEditorStore.getState();
      expect(state.canUndo).toBe(true);
    });

    it('should undo last action', () => {
      const { addElement, undo, elements } = useEditorStore.getState();

      addElement({ type: 'wall', x: 100 });
      const countAfterAdd = useEditorStore.getState().elements.length;

      undo();

      const state = useEditorStore.getState();
      expect(state.elements.length).toBe(countAfterAdd - 1);
    });
  });

  describe('Zoom Controls', () => {
    it('should set zoom within bounds', () => {
      const { setZoom, zoom } = useEditorStore.getState();

      setZoom(2.5);
      expect(useEditorStore.getState().zoom).toBe(2.5);

      setZoom(10); // Should clamp to max 5
      expect(useEditorStore.getState().zoom).toBe(5);

      setZoom(0.01); // Should clamp to min 0.1
      expect(useEditorStore.getState().zoom).toBe(0.1);
    });
  });

  describe('localStorage Debounce (P1 Fix)', () => {
    it('should save elements to localStorage with debounce', (done) => {
      const { addElement } = useEditorStore.getState();

      addElement({ type: 'wall', x: 100 });

      // Wait for debounce (500ms + buffer)
      setTimeout(() => {
        const saved = JSON.parse(localStorage.getItem('planify-elements') || '[]');
        expect(saved.length).toBe(1);
        done();
      }, 1000);
    });
  });
});
