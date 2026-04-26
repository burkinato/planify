'use client';

import { useEffect, useCallback } from 'react';
import { useEditorStore, useShallow } from '@/store/useEditorStore';

export function useKeyboardShortcuts(exportFn?: () => void) {
  const {
    setTool, selectedIds, removeElements, duplicateElements,
    updateElement, elements, undo, redo, setZoom, zoom,
    focusedRegionId, setFocusedRegionId,
    copySelection, pasteSelection,
  } = useEditorStore(useShallow((s) => ({
    tool: s.tool,
    setTool: s.setTool,
    selectedIds: s.selectedIds,
    removeElements: s.removeElements,
    duplicateElements: s.duplicateElements,
    updateElement: s.updateElement,
    elements: s.elements,
    undo: s.undo,
    redo: s.redo,
    setZoom: s.setZoom,
    zoom: s.zoom,
    focusedRegionId: s.focusedRegionId,
    setFocusedRegionId: s.setFocusedRegionId,
    copySelection: s.copySelection,
    pasteSelection: s.pasteSelection,
  })));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

    // Tool shortcuts
    if (!e.ctrlKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'v': setTool('select'); break;
        case 'w': setTool('wall'); break;
        case 'p': setTool('window'); break;
        case 'd': setTool('door'); break;
        case 't': setTool('text'); break;
        case 'm': setTool('rect'); break;
        case 's': setTool('symbol'); break;
        case 'r': setTool('rescue-route'); break;
        case 'q': setTool('evacuation-route'); break;
        case 'e': setTool('eraser'); break;
        case 'escape':
          if (focusedRegionId) setFocusedRegionId(null);
          setTool('select');
          useEditorStore.getState().setSelectedIds([]);
          break;
      }
    }

    // Delete selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
      e.preventDefault();
      removeElements(selectedIds);
    }

    // Ctrl shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          copySelection();
          break;
        case 'v':
          e.preventDefault();
          pasteSelection();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'd':
          e.preventDefault();
          if (selectedIds.length > 0) duplicateElements(selectedIds);
          break;
        case 's':
          e.preventDefault();
          exportFn?.();
          break;
        case '=':
        case '+':
          e.preventDefault();
          setZoom(zoom + 0.1);
          break;
        case '-':
          e.preventDefault();
          setZoom(zoom - 0.1);
          break;
      }
    }

    // Arrow keys for nudging
    if (selectedIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      
      selectedIds.forEach(id => {
        const el = elements.find(el => el.id === id);
        if (!el) return;
        const updates: Record<string, number> = {};
        if (e.key === 'ArrowUp') updates.y = el.y - step;
        if (e.key === 'ArrowDown') updates.y = el.y + step;
        if (e.key === 'ArrowLeft') updates.x = el.x - step;
        if (e.key === 'ArrowRight') updates.x = el.x + step;
        updateElement(id, updates);
      });
    }
  }, [setTool, selectedIds, removeElements, duplicateElements, updateElement, elements, undo, redo, setZoom, zoom, exportFn, focusedRegionId, setFocusedRegionId, copySelection, pasteSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
