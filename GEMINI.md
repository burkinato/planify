# Planify Project Context & Guidelines

This file provides the core architectural context, design system conventions, and development guidelines for the Planify application. AI Agents MUST follow these rules when implementing features or fixing bugs in this project.

## 1. High-Level Tech Stack
- **Framework:** Next.js (App Router) v14+
- **State Management:** Zustand (Modular store files in `src/store`)
- **Canvas/Graphics:** Konva.js (`react-konva`)
- **Styling:** Tailwind CSS v4 (Custom configurations in `globals.css`)
- **Database & Auth:** Supabase (PostgreSQL, Auth, RLS)
- **Icons:** `lucide-react`
- **PDF/Image Export:** `jspdf`, `html-to-image`, `html2canvas`

## 2. Directory Structure & Architecture
The project strictly follows a domain-driven structure within `planify-app/src`:
- **`src/app/`**: Next.js App Router logic. Route groups are used to isolate contexts (e.g., `(auth)`, `pxadmin`, `dashboard`, `editor`).
- **`src/components/`**: UI components organized by domain (`admin`, `dashboard`, `editor`, `landing`, `shared`). **NEVER** place a component directly in `src/components` without a domain folder.
- **`src/lib/`**: Business logic, utility functions, and third-party integrations (Supabase clients, PayTR logic, validation).
- **`src/store/`**: Zustand state modules (`useEditorStore.ts`, `useProjectStore.ts`, etc.).
- **`docs/editor-architecture/`**: **CRITICAL!** Contains deep-dive documentation for the canvas editor. Always refer to `00-index.md` before making any changes to the editor.
- **`scripts/`**: Node.js scripts for database migrations, seeding, or debug tooling.

## 3. Design System & UI/UX Guidelines (Premium SaaS & Seamless Minimalist)
The application follows a "Dark Mode Default" aesthetic with premium, glassmorphism touches.
- **Color Palette (Surface):** The core background is `bg-surface-950`. Modals, panels, and sidebars use `bg-surface-900` or `bg-surface-800`.
- **Text Formatting:** Use small, highly legible, and bold fonts for labels: e.g., `text-[10px] font-black uppercase tracking-widest` or `tracking-[0.2em]`.
- **Borders & Corners:** Soft, rounded corners (`rounded-lg`, `rounded-xl`, `rounded-2xl`) with subtle borders (`border-surface-600/30`).
- **Interactive Feedback:** 
  - Use `group` and `group-hover` extensively.
  - Apply custom Tailwind classes from `globals.css` such as `dash-glass`, `dash-card`, `premium-card-container` for elevated components.
  - Leverage animations like `animate-in fade-in slide-in-from-bottom-4 duration-700` and `dash-stagger`.
- **Icons:** Use `lucide-react` exclusively. Standard icon sizes are `w-4 h-4` or `w-5 h-5`. For emphasis, place them in subtle gradient or colored backgrounds (e.g., `text-blue-500` inside `bg-blue-500/10`).

## 4. State Management Rules (Zustand)
- **Modularity:** Do not bloat a single store. If a new major feature is added, consider if it belongs in `useEditorStore.ts` or if a new store (like `useAnalyticsStore.ts`) is needed.
- **Performance:** For large stores (like `useEditorStore`), always extract state using `useShallow` in components to prevent unnecessary re-renders. Example:
  ```typescript
  import { useShallow } from 'zustand/react/shallow';
  const { elements, addElement } = useEditorStore(useShallow(state => ({
    elements: state.elements,
    addElement: state.addElement
  })));
  ```
- **Async Operations:** All Supabase fetches, updates, and deletes are handled directly within the Zustand store actions. Do not fetch data inside `useEffect` in components if it belongs to a global state.

## 5. Development Workflows
- **Supabase Integration:** Always use `createClient()` from `src/lib/supabase/client.ts` (for client components) or `server.ts` (for server components).
- **Component Typings:** Define strict TypeScript interfaces for all components and store states.
- **Error Handling & Toasts:** Use `sonner` (`toast.success`, `toast.error`) for immediate user feedback on actions.
- **Clean Code:** Avoid dead code. If modifying a feature, remove unused imports and outdated functions immediately.

## 6. AI Agent Instructions
- **Read First:** When tasked with a canvas/editor issue, READ `docs/editor-architecture/00-index.md` first to locate the correct file.
- **Design Consistency:** When creating a new UI component, mimic the exact class structures (tracking, font weights, colors) found in `src/components/dashboard/ProjectDossierGrid.tsx` or `PortalSidePanel.tsx`.
- **No Hacks:** Avoid overriding CSS specificity with `!important` unless dealing with strict third-party overrides (like the PDF export system attributes).
- **Token & Context Efficiency:** Always prioritize token efficiency. Do not read entire monolithic files if a targeted `grep_search` or reading a specific line range will suffice. Keep your responses and tool outputs concise to preserve the context window.
