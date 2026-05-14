# Planify Project Context & GPT Guidelines

This file defines the architectural context, design system conventions, and implementation rules for the Planify application. GPT-based coding agents and contributors MUST follow these rules when implementing features, fixing bugs, or reviewing changes in this project.

## 1. High-Level Tech Stack
- **Framework:** Next.js (App Router) v15+
- **State Management:** Zustand (modular store files in `src/store`)
- **Canvas/Graphics:** Konva.js (`react-konva`)
- **Styling:** Tailwind CSS v4 (custom configuration in `globals.css`)
- **Database & Auth:** Supabase (PostgreSQL, Auth, RLS)
- **Icons:** `lucide-react`
- **Primary AI Workflow:** GPT-based coding assistance and repository-aware tooling

## 2. Directory Structure & Architecture
The project strictly follows a domain-driven structure within `planify-app/src`:
- **`src/app/`**: Next.js App Router logic.
- **`src/components/`**: UI components organized by domain (`admin`, `dashboard`, `editor`, `landing`, `shared`). **NEVER** place a component directly in `src/components` without a domain folder.
- **`src/lib/`**: Business logic, utility functions, and third-party integrations (Supabase, PayTR, validation).
- **`src/store/`**: Zustand state modules.
- **`docs/`**: ADRs, architecture deep-dives, and domain documentation.
- **`scripts/`**: DevOps scripts for migrations and database seeding.

## 3. Core Architectural Principles
- **Supabase-First Persistence**: `localStorage` is for caching only. The single source of truth is Supabase. The editor auto-saves every 3 seconds.
- **Hybrid Monetization**: The product combines a $5/month Pro subscription with a micro-credit model such as 50 credits per project. Use `useCreditStore` for balance checks.
- **Component Decoupling**: Large components such as `EditorCanvas.tsx` MUST be split into smaller renderers. Geometry logic belongs in `lib/editor/wallGeometry.ts`.
- **Atomic Rendering**: Elements should be rendered through a central dispatcher such as `ElementDispatcher.tsx` to prevent monolithic component growth.

## 4. State Management Rules
- **Modularity**: Do not bloat existing stores. If a new major feature is introduced, consider a dedicated store such as `useAnalyticsStore.ts`.
- **Performance**: Use `useShallow` when extracting Zustand state in components.
- **Security**: Sensitive state mutations must go through secure Supabase RPCs such as `deduct_credits_secure`.

## 5. GPT Agent Working Rules
- **Context Efficiency**: Do not read entire files unless necessary. Prefer targeted search and focused reads.
- **File Length**: Keep files under 500 lines where practical. `EditorCanvas.tsx` should be treated as a refactor priority if touched.
- **Testing**: Every feature addition or bug fix MUST include or update a corresponding test in `__tests__` or the project test location.
- **Documentation**: Update `docs/` whenever an architectural decision or behavior contract changes.
- **Minimal Changes**: Prefer the smallest safe change that fixes the root cause.
- **Consistency**: Preserve existing naming, folder structure, and public APIs unless a change is explicitly required.

## 6. Review Expectations
- Verify behavior, not just syntax.
- Check for regressions in editor flows, persistence, and credit-related logic.
- Confirm that Supabase interactions respect RLS and existing validation boundaries.
- Prefer maintainable abstractions over quick patches in shared editor code.
