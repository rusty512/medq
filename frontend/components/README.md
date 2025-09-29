Components Directory Guide

Overview
- This folder houses all frontend UI building blocks organized by purpose.
- We use shadcn/ui primitives (Radix + Tailwind) as the base and compose custom components on top.

Structure
- ui/: Pure shadcn primitives (button, card, input, select, popover, command, etc.). Do not fork styles here unless upstream changes.
- forms/: Form UIs (login, register, onboarding) using react-hook-form + zod. Prefer reusing ui primitives.
- layout/: App-level layout pieces (navigation, sidebar, headers, wrappers).
- features/: Feature-specific components (tables, dashboards, facturation blocks, etc.).
- shared/: Reusable business components that don’t belong to a single feature.

Usage Guidelines
- Always import primitives from ui/ and compose in forms/, layout/, features/, or shared/.
- Styling: use Tailwind tokens from app/globals.css (CSS variables) and the cn() utility from lib/utils.
- Spacing & rhythm: prefer space-y-* within stacks, consistent px-6 in cards, and mt-* between sections.
- Typography: follow Geist Sans as default; headings via Tailwind text sizes.

Forms
- Use react-hook-form + zod for validation.
- Shared form controls live in ui/ (Form, FormField, FormItem, etc.).
- Keep validation schemas next to their forms.

Do/Don’t
- Do reuse Button, Card, Input, Select consistently.
- Don’t duplicate variants or create near-duplicates of primitives.
- Do colocate feature components under features/ and keep them small and composable.

Examples
- LoginForm: components/app/components/form/login/LoginForm.tsx (to be moved into components/forms/login if needed later).
- Onboarding steps: components/forms/onboarding/*.


