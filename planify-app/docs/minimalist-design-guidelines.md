# Planify Minimalist Dashboard Design Guidelines

## Core Philosophy
The application has moved away from "heavy SaaS/Premium" aesthetics (like excessive glassmorphism, heavy blur backgrounds, glowing borders, and oversized typography) to a **Clean, Minimalist, White/Light-themed Dashboard** approach.

## Key Rules
1. **Layout & Spacing:** Use standard, compact dashboard sizing. Use `max-w-5xl` for page width containment. Avoid excessive paddings like `p-8` or `p-10`; prefer `p-6` or `p-4`.
2. **Typography:** Keep text sizes proportionate. Do not use `text-5xl` or `text-3xl` for standard headers. Use `text-xl` or `text-2xl` for page titles, and `text-sm` or `text-xs` for descriptions.
3. **Cards & Containers:** Use plain white backgrounds (`bg-white dark:bg-surface-900`) with subtle, solid borders (`border-slate-200 dark:border-surface-700`). Use soft rounded corners (`rounded-xl` or `rounded-2xl`). Avoid complex gradients unless absolutely necessary for highlighting a premium tier.
4. **Shadows:** Use very soft shadows (`shadow-sm`, `shadow-[0_1px_2px_rgba(16,24,40,.04)]`) instead of large glowing shadows (`shadow-xl` or colored shadows).
5. **Interactive Elements:** Buttons should be reasonably sized (`h-9` or `h-11`, NOT `h-14`). Use solid colors (`bg-blue-600`) or soft backgrounds (`bg-[#f5f8ff] text-blue-600`) for secondary actions.
6. **No "Project = Credit" Confusion:** Ensure language is clear. Cost of actions (e.g., "50 Kredi") should be clearly separated from the concept of a single "Project".

## Agent Task
Review non-editor pages (like Profile, Archive, and PXAdmin sections) and check if they violate these guidelines. Provide a detailed markdown report on what needs to be changed.
