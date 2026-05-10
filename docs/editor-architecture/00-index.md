# Planify Editor Architecture: Index

This folder contains a deeply technical, component-by-component breakdown of the Planify Editor. It is explicitly designed for AI Agents to quickly grasp the structural logic, state management, and rendering pipelines of the Planify App, preventing the need to waste tokens re-reading the entire monolithic codebase.

## How to use this documentation

Whenever you (the AI Agent) are tasked with creating a new feature, modifying an existing one, or fixing a bug in the editor, identify the relevant domain from the list below and read ONLY the specific document related to it.

## Table of Contents

- **`01-state-management.md`**
  Read this if you need to understand or modify how elements are stored, the Undo/Redo stack, saving to localStorage/Supabase, or any logic involving `useEditorStore.ts` and `types/editor.ts`.

- **`02-canvas-engine.md`**
  Read this if you need to interact with the Konva `<Stage>`, handle "Infinite Canvas" (zooming/panning), or modify global mouse events (`handleStageMouseDown`, etc.) inside `EditorCanvas.tsx`.

- **`03-tools-and-geometry.md`**
  Read this if you are adding a new drawing tool, modifying wall rendering (`wallGeometry.ts`), handling snap logic (`findSnapPoint`), or managing the dimension input overlay (`dimInput`).

- **`04-template-system.md`**
  Read this if you are working with ISG (Occupational Health & Safety) templates. It explains how paper layouts work, `TemplateModuleInstance`, compliance checking (`validateCompliance`), and the `TemplatePaperRenderer.tsx`.

- **`05-ui-layout.md`**
  Read this if you need to modify the UI that surrounds the canvas. It covers `EditorApp.tsx` (the orchestrator), `EditorLeftSidebar.tsx` (tool selection, symbols, SVGs), and the new split right sidebar (`TemplateModulePanel.tsx` and `ModuleEditDrawer.tsx`).

- **`06-export-engine.md`**
  Read this if you need to modify how the canvas is exported to PNG or PDF, including theme toggling, `html-to-image` usage, and rendering resolutions.

- **`07-routing-and-auth.md`**
  Read this if you are working on how projects are loaded from Supabase via URL parameters (`?id=`, `?template=`), auth guards, or Pro user access checks.

- **`08-shortcuts-and-events.md`**
  Read this if you need to modify global hotkeys (Delete, Escape), Spacebar panning logic, or native DOM event traps on the canvas.

## High-Level Tech Stack Overview

- **Framework**: Next.js (App Router)
- **State Management**: Zustand (with selective re-rendering via `useShallow`)
- **Canvas Rendering**: `react-konva` (Konva.js)
- **Styling**: TailwindCSS
- **Persistence**: LocalStorage (Debounced) + Supabase (Auto-save every 3s)
- **Exporting**: `html-to-image` (PNG) + PDF export module.
