# ADR 001: Supabase-First Persistence Strategy

## Status
Proposed

## Context
The application initially relied heavily on `localStorage` for project persistence. While fast, this leads to data loss if users clear browser data or switch devices. A hybrid approach was implemented, but the source of truth remained ambiguous.

## Decision
We are moving to a **Supabase-First** persistence model.
1. **Single Source of Truth**: The Supabase `projects` table is the definitive state.
2. **Auto-Save Loop**: `EditorApp.tsx` maintains a 3-second debounced sync loop to Supabase.
3. **localStorage as Cache**: `localStorage` will only be used to:
   - Cache project state for offline edits (if implemented later).
   - Restore unsaved changes in case of a crash before the next sync.
4. **Hydration**: On project load, the app must fetch from Supabase and only use `localStorage` if the local version is newer (via `updated_at` timestamp check).

## Consequences
- Increased database write frequency (mitigated by debouncing).
- Improved cross-device experience.
- Requirement for stable internet connection for persistent saving.
