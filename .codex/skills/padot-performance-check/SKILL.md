---
name: padot-performance-check
description: Performance audit workflow for Padot Movie Awards. Use when the user asks for 코드 성능 점검, performance review, speed audit, bundle check, rendering bottlenecks, database query performance, Next.js App Router optimization, React client bundle reduction, image optimization, or TMDB/Supabase latency risks.
---

# Padot Performance Check

## Audit Stance

Find concrete performance risks before style preferences. Prefer issues that affect route latency, hydration cost, bundle size, database query count, image stability, or user-perceived responsiveness.

Do not introduce new dependencies or broad rewrites unless the user asks for fixes.

## Project Context

Optimize for this stack:

- Next.js 16 App Router and React 19 Server Components.
- Supabase PostgreSQL through Prisma with pooled `DATABASE_URL`.
- TMDB metadata and poster images.
- Tailwind CSS v4 and glassmorphism UI.
- Tiptap editor, which can be expensive and should stay out of server-rendered read paths unless needed.

## Workflow

1. Inspect the requested scope. If none is provided, review the current git diff and key routes under `app/`.
2. Read `package.json`, `next.config.ts`, touched components, data access code, and nearby callers.
3. Identify the page or interaction where each performance concern appears.
4. Run focused checks when useful:
   - `npm run build` for Next.js route and bundle signals
   - `npm run lint` for obvious rendering or hook issues
   - browser QA only if a dev server is already running or the user asks for visual/perf testing
5. Separate measured facts from inferred risks.

## Performance Checklist

Check for:

- Unnecessary `"use client"` boundaries that pull large trees into the client bundle.
- Heavy libraries such as Tiptap imported into pages that do not need editing.
- Server Components that fetch too much data or pass large serialized objects to clients.
- Prisma N+1 queries, unbounded `findMany`, missing `orderBy`, missing pagination, or selecting unused columns.
- TMDB calls made repeatedly without caching, debouncing, or error/rate-limit handling.
- Poster images without stable dimensions, `sizes`, meaningful `alt`, or appropriate priority.
- Calendar/grid/list views that render too many interactive client nodes.
- Expensive filtering or sorting done on every render instead of server-side or memoized client-side.
- Loading states that block the whole page when a smaller Suspense boundary would keep the UI responsive.
- CSS or animation choices that cause layout shift, excessive blur cost, or text overflow on mobile.

## Output Format

Write in Korean. Use this order:

1. Findings ordered by impact, with file and line reference.
2. For each finding, state whether it is measured or inferred from code.
3. Recommended fix direction with expected effect.
4. Verification run and skipped checks.
5. Short summary of the highest-value improvements.

If no performance issues are found, say so and list any checks that were not run.
