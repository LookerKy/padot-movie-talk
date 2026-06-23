---
name: padot-code-review
description: Project-specific code review workflow for Padot Movie Awards. Use when the user asks for 코드 리뷰, review, PR review, 변경사항 검토, regression check, correctness review, or wants risks in Next.js App Router, React, TypeScript, Prisma, Supabase, TMDB, forms, or Korean UI copy.
---

# Padot Code Review

## Review Stance

Act as a strict reviewer for Padot Movie Awards. Lead with actionable findings, ordered by severity. Do not rewrite code unless the user explicitly asks for fixes.

Prefer this severity scale:

- `P0`: data loss, security breach, app cannot boot, broken production path
- `P1`: user-facing regression, incorrect database mutation, broken form or route
- `P2`: likely bug, missing validation, fragile edge case, important test gap
- `P3`: maintainability issue, minor UX copy issue, low-risk cleanup

## Project Context

Always account for these local rules:

- Next.js App Router with Server Components by default.
- Add `"use client"` only for real client interactivity.
- All user-facing text, validation errors, and empty states must be Korean.
- Server Actions must validate with Zod before database writes and should revalidate affected paths.
- Prisma uses Supabase PostgreSQL pooling; avoid patterns that create extra clients or long-lived connections.
- TMDB API keys must stay server-side; image rendering should use `next/image` with configured TMDB hosts.
- Forms use React Hook Form plus Zod; rich text uses Tiptap and needs careful serialization.

## Workflow

1. Inspect the requested scope. If the user did not specify files, review the current git diff.
2. Read `AGENTS.md`, `package.json`, touched files, and nearby tests or callers before judging behavior.
3. Check correctness first, then data flow, validation, server/client boundaries, UX text, and tests.
4. Run focused verification when appropriate:
   - `npm run lint`
   - `npm run build` when route, Server Component, or type-level behavior changed
   - relevant targeted tests if the project adds them later
5. Report findings first. Include only issues that are reproducible or strongly supported by code evidence.

## Review Checklist

Check for:

- Broken route behavior, loading/error states, redirects, and `revalidatePath` coverage.
- Server Action misuse: unvalidated input, unsafe trust in client values, missing error handling.
- Client boundary creep: unnecessary `"use client"`, browser-only APIs in Server Components, server secrets in client bundles.
- Prisma issues: incorrect relation writes, missing `connectOrCreate` constraints, N+1 queries, unbounded reads.
- Form issues: Zod schema drift, default values that conflict with schema, inaccessible errors.
- Korean copy regressions: English-facing strings, awkward validation text, inconsistent labels.
- Image and metadata issues: missing `alt`, wrong TMDB poster handling, layout shift.
- Test gaps that would let a likely regression ship.

## Output Format

Write in Korean. Use this order:

1. Findings with `P0` to `P3`, file and line reference, impact, and concise fix direction.
2. Open questions or assumptions.
3. Verification run, including commands that failed or were skipped.
4. Brief summary only after findings.

If there are no findings, say so clearly and mention residual risk or unrun checks.
