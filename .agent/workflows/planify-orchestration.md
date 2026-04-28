# Planify Orchestration Workflow

## /planify-feature
Use this workflow when implementing a new feature in Planify.

### Phase 1: Analysis (planify-core)
- Evaluate ISO 7010 compliance requirements.
- Identify impact on `canvas_json` schema in Supabase.
- Check for existing UI patterns in `planify-app/src/components/`.

### Phase 2: Design (planify-editor)
- Define Konva layer interactions.
- Plan store updates in `useEditorStore`.
- Verify performance implications (caching/rendering).

### Phase 3: Implementation
- 🤖 **frontend-specialist**: Build UI components and hooks.
- 🤖 **backend-specialist**: (If needed) Update Supabase schemas/policies.
- 🤖 **test-engineer**: Create integration tests for the new feature.

### Phase 4: Final Review
- Run `python .agent/scripts/checklist.py`.
- Manual verification using the test account.

---

## /planify-editor-fix
Use this workflow for bugs inside the canvas editor.

1. **Reproduce**: Use `debugger` agent to isolate the Konva event or Store action.
2. **Fix**: Use `planify-editor` skill to ensure Konva best practices are followed.
3. **Verify**: Check `jspdf` export to ensure the fix doesn't break PDF output.
