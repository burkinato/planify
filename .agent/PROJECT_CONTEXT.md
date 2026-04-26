# Planify Project Context

## Overview
Planify is a professional SaaS platform for creating architectural evacuation plans and blueprint-style drawings. It features a high-performance infinite canvas editor, a multi-tier subscription model, and standardized architectural symbol libraries.

## Technology Stack
- **Frontend**: Next.js (App Router), React, Konva.js (Canvas), Zustand (State Management), TailwindCSS.
- **Backend**: Next.js API Routes, Supabase (Database & Auth).
- **Payments**: PayTR (Checkout & Webhooks).
- **Architecture**: Professional "Corporate Light" design system, component-driven UI.

## Core Modules

### 1. The Editor (`src/components/editor`)
- **Engine**: React-Konva based infinite canvas.
- **State**: Managed via `useEditorStore.ts` (Zustand). Supports undo/redo, layers, and element persistence.
- **Math**: Specialized wall geometry logic in `wallGeometry.ts` (snapping, T-junctions, ortho-guides).
- **Standards**: ISO-compliant symbols (`isoSymbols.ts`).
- **Tiers**: Free users see watermarks; Pro users have full feature access.

### 2. Landing Page (`src/app/page.tsx`)
- Optimized for performance using dynamic imports.
- Sections: Hero, Features, Showcase, HowItWorks, Pricing, Testimonials, Footer.

### 3. Dashboard (`src/app/dashboard`)
- User project management and profile settings.
- Subscription status tracking.

### 4. Payments (`src/app/api/payments`)
- Integrated with PayTR.
- Handles checkout sessions and webhook notifications for subscription status updates.

## Design Philosophy
- **Rich Aesthetics**: High-fidelity UI with smooth animations and professional typography.
- **Efficiency**: Token-optimized logic and minimized context overhead.
- **Precision**: CAD-grade snapping and geometry handling.
