# 07 - Routing, Data Fetching & Auth

This document explains how projects are loaded into the editor and how security/authentication is handled.

## Parsing URL Parameters

The editor lives at `/editor`. It uses Next.js `useSearchParams()` to determine what to load:
- `?id=xyz`: Denotes an existing project ID.
- `?template=xyz`: Denotes the slug of the template to use if the project is newly created and has no existing canvas data.

## The Load Lifecycle (`EditorApp.tsx`)

1. **Initial Fetch**: When the component mounts, if an `id` is present, it triggers `fetchProjects()` and `fetchTemplateLayouts()` from `useProjectStore`.
2. **Merging Data**:
   - The app searches for the loaded project in the `projects` array.
   - If `project.canvas_data` exists, it means the user has drawn something before. It passes this data to `useEditorStore.getState().loadProject()`.
   - If `project.canvas_data` is empty (new project), the system cross-references the `templateSlug` with the database layouts and injects the default template schema (e.g., Header, DrawingArea) into `loadProject`.
3. **Auto-Save Loop**: A `setTimeout` loops every 3 seconds. It compares the current `canvas_data` snapshot to `lastSavedSnapshotRef`. If changes are detected, it updates the database via Supabase.

## Authentication & Pro Access

- **Auth Guard**: Handled via `useAuthStore()`. If `!isLoading` and `!user`, the app triggers a toast and hard-redirects the user to `/login`.
- **Pro Tier Restrictions**: 
  - `profile?.subscription_tier === 'pro'` (or the `useProAccess` hook) is checked throughout the app.
  - E.g., The "Pro" badge in the UI, or restricting high-res PDF exports to Pro users by passing the `isPro` boolean to `exportToPDF()`.
  - If a user loses focus of the browser (`window.onblur`), the free tier logic deliberately sets `isFocused` to false to pause certain activities or enforce strict usage policies.
