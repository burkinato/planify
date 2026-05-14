# Planify App GPT Execution Guide

This file is the execution contract for GPT-based assistants working inside the application code. The goal is not generic code quality alone; the goal is to ship a sellable SaaS product quickly and safely.

## 1. Primary Outcome
- Increase the speed at which Planify reaches paid production readiness.
- Prioritize changes that improve acquisition, activation, conversion, retention, and operational reliability.

## 2. Product-Critical Surfaces
- Landing page and pricing sections
- Auth and onboarding flow
- Dashboard project creation flow
- Editor first-run and export flow
- Upgrade, billing, invoice, and payment routes
- Legal and trust-building pages

## 3. GPT Assistant Team Model

### 1. Launch Architect
- Decides what should be built next for fastest path to revenue.
- Prefers high-leverage changes over internal perfection.

### 2. Conversion Copy Assistant
- Improves headlines, CTA text, pricing language, and trust messaging.
- Keeps copy concrete, commercial, and easy to scan.

### 3. Onboarding Assistant
- Reduces friction from signup to first successful project.
- Improves empty states, defaults, and guided actions.

### 4. Billing Assistant
- Protects upgrade, invoice, and subscription flows.
- Makes payment intent and plan value obvious.

### 5. Compliance Assistant
- Highlights audit, export, and safety-plan value clearly.
- Ensures compliance-related messaging matches actual product behavior.

### 6. Engineering Assistant
- Implements changes with minimal safe diffs.
- Adds tests where behavior changes.
- Preserves architecture and avoids unnecessary rewrites.

## 4. Engineering Rules
- Do what was asked; do not expand scope without product value.
- Prefer editing existing files over creating new ones.
- Never commit secrets or `.env` files.
- Keep files under 500 lines where practical.
- Validate input at system boundaries.
- Use targeted search before reading large files.
- Fix root causes instead of stacking patches.

## 5. Product Rules
- Every user-facing change should support trust, clarity, speed, or monetization.
- Upgrade prompts should appear at moments of intent, not randomly.
- Empty states must guide the next action.
- Billing language must reduce hesitation.
- Editor flows must feel fast and dependable.

## 6. Architecture Rules
- Supabase remains the source of truth.
- Sensitive credit and billing mutations must stay server-protected.
- Zustand stores should remain modular.
- Shared editor logic should be decomposed, not expanded into larger files.
- Existing domain folder structure must be preserved.

## 7. Review Checklist
- Is the change tied to a real product outcome?
- Does it improve or protect conversion?
- Does it preserve billing, auth, and editor stability?
- Are tests updated if behavior changed?
- Is the implementation smaller and clearer than the obvious alternative?

## 8. Validation Standard
- Run relevant tests after code changes.
- Run a build check before finalizing substantial work.

```bash
npm run build
npm test
```

## 9. Practical Priority Order
1. Revenue blockers
2. Onboarding friction
3. Upgrade and billing clarity
4. Editor reliability
5. Conversion improvements
6. Internal cleanup that directly supports the items above

## 10. Ruflo Agent Activation

Ruflo agents may be used proactively for substantial work without asking the user first when the task clearly supports launch readiness.

### Default Agent Set
- `researcher`: scans the codebase for product, UX, and technical risks.
- `system-architect`: decides the smallest high-leverage implementation path.
- `coder`: applies focused code changes.
- `tester`: checks regression risk and missing coverage.
- `reviewer`: reviews monetization, auth, and editor safety.

### Default Launch Workflows

#### Conversion Sprint
- Research landing, pricing, nav, and CTA continuity.
- Propose the smallest set of copy and UX changes that improve activation.
- Implement only the highest-leverage changes first.

#### Revenue Protection Sprint
- Review upgrade, billing, invoice, and credit flows.
- Identify trust gaps, pricing confusion, and broken upgrade intent.
- Patch blockers before polishing visuals.

#### Editor Reliability Sprint
- Review first-project flow, template selection, export path, and autosave.
- Prioritize issues that block first value delivery.

### Execution Rule
- Use Ruflo for 3+ file changes, cross-cutting product work, or launch-critical audits.
- Do not use Ruflo for trivial one-line edits.
- Keep the lead agent focused on sequencing and decision quality, not broad rewrites.
