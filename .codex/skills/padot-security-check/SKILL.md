---
name: padot-security-check
description: Security audit workflow for Padot Movie Awards. Use when the user asks for 코드 보안 점검, security review, vulnerability audit, secret handling, Server Action trust boundaries, Prisma/Supabase safety, TMDB key exposure, XSS review, dependency audit, or authentication and authorization risks.
---

# Padot Security Check

## Audit Stance

Prioritize exploitable risks and trust-boundary mistakes. Distinguish confirmed vulnerabilities from hardening suggestions. Do not print secrets if discovered; identify the file and variable name only.

## Project Context

Use these assumptions:

- TMDB API keys and database URLs must never enter client bundles.
- Server Actions are the main mutation boundary and must validate input with Zod.
- Prisma writes must avoid trusting client-controlled IDs, tags, rich text, or dates without validation.
- Supabase connection pooling is used for app queries; migrations should use direct URLs only.
- User-facing text and error handling must be Korean, but internal logs must not leak sensitive values.
- Tiptap rich text content can become an XSS surface if rendered unsafely.

## Workflow

1. Inspect the requested scope. If none is provided, review the current git diff plus auth, server actions, API routes, Prisma schema, env handling, and rich text rendering.
2. Read `AGENTS.md`, `env.example`, `next.config.ts`, `prisma/schema.prisma`, server actions, and any touched client components.
3. Trace data from user input to database, external APIs, and rendered HTML.
4. Run local checks when appropriate:
   - `npm run lint`
   - `npm run build` for accidental client/server boundary leaks
   - `npm audit` only with network access or explicit approval
5. Report only actionable issues. Mark broader hardening notes separately.

## Security Checklist

Check for:

- Secrets exposed through `NEXT_PUBLIC_`, client components, logs, thrown errors, or committed files.
- Server Actions that mutate without Zod validation, authorization checks, or safe error handling.
- API routes that accept arbitrary IDs, dates, ratings, tags, or rich text without validation.
- XSS risk from Tiptap content, `dangerouslySetInnerHTML`, Markdown/HTML rendering, or TMDB text.
- Prisma misuse: raw SQL, unchecked writes, mass assignment, missing uniqueness assumptions, unsafe `connect`.
- Supabase misuse: direct URL used at runtime, accidental migration credentials in app code, RLS assumptions without enforcement.
- Auth gaps for future dashboard/admin routes, especially review creation/editing/deletion.
- CSRF or origin assumptions around mutating endpoints outside standard Server Actions.
- Dependency or package-script risks in `package.json`.
- Image and external URL handling that allows untrusted hosts or open redirects.

## Output Format

Write in Korean. Use this order:

1. Confirmed vulnerabilities first with severity `Critical`, `High`, `Medium`, or `Low`.
2. Include file and line reference, attack path, impact, and fix direction.
3. Put hardening suggestions in a separate section.
4. Verification run and skipped checks, especially if `npm audit` was not run.

If no confirmed issues are found, say so clearly and list remaining assumptions.
