# GPT Code Configuration

## Rules

- Do what has been asked; nothing more, nothing less.
- NEVER create files unless absolutely necessary; prefer editing existing files.
- NEVER create documentation files unless explicitly requested.
- NEVER save working files or tests to the repository root; use `/src`, `/tests`, `/docs`, `/config`, or `/scripts`.
- ALWAYS read a file before editing it.
- NEVER commit secrets, credentials, or `.env` files.
- Keep files under 500 lines where practical.
- Validate input at system boundaries.

## GPT Workflow Expectations

- Start by gathering only the context needed for the task.
- Prefer targeted search over reading large files end to end.
- Fix root causes instead of layering temporary patches.
- Preserve existing architecture, naming, and public APIs unless the task requires change.
- Keep edits minimal, reviewable, and consistent with the surrounding code.

## Task Routing Guidance

| Task Type | Primary Focus |
|------|--------|
| Bug Fix | Reproduce, isolate root cause, patch safely, add regression coverage |
| Feature | Fit the existing architecture, update tests, avoid store bloat |
| Refactor | Reduce complexity without changing behavior unless requested |
| Performance | Measure bottlenecks, avoid premature optimization |
| Security | Validate boundaries, secrets handling, and Supabase access patterns |

## When to Go Broad vs Narrow

- **Broader investigation**: use for 3+ files, cross-module refactors, API changes, security-sensitive work, or performance issues.
- **Narrow changes**: use for single-file edits, small bug fixes, copy updates, and isolated config changes.

## Memory And Context

- Reuse repository conventions already present in the codebase.
- Prefer existing utilities and patterns before introducing new abstractions.
- If a repeated implementation pattern is discovered, align with it rather than inventing a parallel approach.

## Review Checklist

- Is the behavior correct under normal and edge-case inputs?
- Does the change preserve editor, persistence, and billing flows?
- Are tests added or updated where behavior changed?
- Is the code easier to maintain than before?
- Are Supabase and auth boundaries still respected?

## Build And Test

- ALWAYS run relevant tests after code changes.
- ALWAYS verify the build succeeds before finalizing substantial changes.

```bash
npm run build
npm test
```

## Tooling Guidance

- Use repository-aware search and targeted file reads first.
- Use terminal commands for validation, builds, and test execution.
- Prefer precise edits over broad rewrites.

## Setup Notes

This repository is intended to work well with GPT-based coding assistants in VS Code or similar environments. The assistant should handle code changes, reviews, tests, and repository navigation while following the rules above.
