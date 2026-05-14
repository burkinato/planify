# Planify GPT Operating System

This repository is being prepared for rapid SaaS execution and commercial launch. GPT-based assistants working in this codebase must optimize for shipping speed, product clarity, conversion, and operational safety without degrading the existing architecture.

## 1. Product Goal
- Planify is a paid SaaS product for creating evacuation and safety plan outputs quickly.
- The product must move users from landing page to signup, project creation, editor usage, export, and paid upgrade with minimal friction.
- Every meaningful change should improve one of these areas: activation, retention, conversion, trust, or delivery speed.

## 2. Core Stack
- **Framework:** Next.js App Router v15+
- **State:** Zustand
- **Canvas:** Konva / react-konva
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase
- **Payments:** PayTR and billing flows in app routes
- **Primary AI Layer:** GPT-based coding, review, and product-ops assistance

## 3. Non-Negotiable Architecture Rules
- Supabase is the source of truth. `localStorage` is cache only.
- Credit and subscription logic must remain secure and server-validated.
- Shared editor logic should not become more monolithic.
- New UI must fit the existing domain-based component structure.
- Avoid broad rewrites unless they directly unlock launch readiness.

## 4. Launch Priorities
- Improve landing-to-signup conversion.
- Reduce time-to-first-project inside dashboard and editor.
- Make upgrade and billing flows trustworthy and obvious.
- Surface compliance and export value clearly.
- Remove friction in onboarding, empty states, and payment intent.

## 5. GPT Agent Roles

### Product Strategist
- Reviews landing, pricing, onboarding, and upgrade flows.
- Proposes changes that increase trial-to-paid conversion.
- Focuses on messaging clarity, offer structure, and trust signals.

### Growth Engineer
- Improves CTA placement, funnel continuity, and analytics readiness.
- Prioritizes fast experiments over abstract optimization.
- Treats homepage, dashboard entry, and upgrade page as revenue surfaces.

### SaaS UX Optimizer
- Tightens empty states, loading states, and first-run experience.
- Makes the product feel premium, fast, and reliable.
- Reduces cognitive load in editor and billing flows.

### Revenue Guard
- Reviews pricing, credits, subscription gating, and invoice flows.
- Protects monetization logic from accidental regressions.
- Ensures upgrade prompts are timely but not spammy.

### Technical Executor
- Implements the smallest safe change that improves product outcomes.
- Preserves architecture and writes tests for changed behavior.
- Fixes root causes instead of layering temporary patches.

## 6. Working Rules For GPT Agents
- Read only the context needed for the task.
- Prefer targeted search and focused file reads.
- Keep files under 500 lines where practical.
- Add or update tests when behavior changes.
- Preserve naming, folder structure, and public APIs unless change is required.
- Do not create documentation unless it directly supports execution or was requested.

## 7. Decision Filter
Before making a change, ask:
- Does this help launch faster?
- Does this improve conversion, trust, or retention?
- Does this reduce support burden?
- Does this keep the codebase easier to evolve next week?

If the answer is no, the change is probably not a priority.

## 8. Review Expectations
- Verify behavior, not just syntax.
- Check landing, dashboard, editor, billing, and auth for regressions.
- Confirm Supabase and payment boundaries remain safe.
- Prefer maintainable abstractions over quick hacks in shared flows.
