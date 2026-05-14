# Planify Project Context & Guidelines

This file provides the core architectural context, design system conventions, and development guidelines for the Planify application. AI Agents MUST follow these rules when implementing features or fixing bugs in this project.

## 1. High-Level Tech Stack
- **Framework:** Next.js (App Router) v15+
- **State Management:** Zustand (Modular store files in `src/store`)
- **Canvas/Graphics:** Konva.js (`react-konva`)
- **Styling:** Tailwind CSS v4 (Custom configurations in `globals.css`)
- **Database & Auth:** Supabase (PostgreSQL, Auth, RLS)
- **Icons:** `lucide-react`
- **Orchestration:** Ruflo (Claude Flow) multi-agent swarm

## 2. Directory Structure & Architecture
The project strictly follows a domain-driven structure within `planify-app/src`:
- **`src/app/`**: Next.js App Router logic.
- **`src/components/`**: UI components organized by domain (`admin`, `dashboard`, `editor`, `landing`, `shared`). **NEVER** place a component directly in `src/components` without a domain folder.
- **`src/lib/`**: Business logic, utility functions, and third-party integrations (Supabase, PayTR, validation).
- **`src/store/`**: Zustand state modules.
- **`docs/`**: ADRs, architecture deep-dives, and domain documentation.
- **`scripts/`**: DevOps scripts for migrations and database seeding.

## 3. Core Architectural Principles (ADR Summaries)
- **Supabase-First Persistence**: `localStorage` is for caching only. The single source of truth is Supabase. Every 3 seconds, the editor performs an auto-save.
- **Hybrid Monetization**: Combines a $5/mo subscription (Pro) with a micro-credit model (e.g., 50 credits/project). Use `useCreditStore` for balance checks.
- **Component Decoupling**: Large components like `EditorCanvas.tsx` MUST be split into smaller renderers. Geometry logic belongs in `lib/editor/wallGeometry.ts`.
- **Atomic Rendering**: Elements should be rendered via a central dispatcher (`ElementDispatcher.tsx`) to prevent monolithic component growth.

## 4. State Management (Zustand)
- **Modularity**: Do not bloat stores. If a new major feature is added, consider a new store (e.g., `useAnalyticsStore.ts`).
- **Performance**: Always use `useShallow` when extracting state in components.
- **Security**: Supabase RPCs (like `deduct_credits_secure`) must be used for sensitive state mutations.

## 5. Ruflo Multi-Agent Orchestration
This project integrates **Ruflo** (Claude Flow) for task delegation.
- **Platform**: OpenRouter with `qwen/qwen-2.5-coder-32b-instruct:free`.
- **Commands**: 
  - `npx ruflo task create "description"`
  - `npx ruflo swarm init`
- **Agent Roles**: `coder`, `reviewer`, `tester`, `researcher`, `system-architect`.

## 6. AI Agent Mandates
- **Context Efficiency**: Do not read entire files. Use `grep_search` and targeted `read_file`.
- **File Length**: Keep files under 500 lines. Refactor `EditorCanvas.tsx` (current: 2000+) as a priority.
- **Testing**: Every feature addition or bug fix MUST include a corresponding test in `__tests__`.
- **Documentation**: Update `docs/` whenever an architectural decision is made.
