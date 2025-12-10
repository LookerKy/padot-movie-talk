# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Padot Movie Awards** is a web application for archiving movie reviews by the virtual streamer Padot. The application allows the streamer to record reviews, ratings, and one-liners for movies watched with viewers.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19.2.1
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma with Postgres adapter (@prisma/adapter-pg)
- **Styling**: Tailwind CSS v4 with Glassmorphism design
- **External API**: TMDB (The Movie Database) for movie metadata
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: Tiptap editor for review content

## Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Build & Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint

# Database
npx prisma migrate dev        # Run migrations in development
npx prisma generate           # Generate Prisma client
npx prisma studio             # Open Prisma Studio GUI
npx prisma db push            # Push schema changes without migration
```

## Environment Setup

Required environment variables (see `env.example`):

```bash
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://..."           # Connection pooler URL (port 6543)
DIRECT_URL="postgresql://..."             # Direct connection (port 5432)

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."

# TMDB API
TMDB_API_KEY="your-tmdb-api-key"
```

**Important**: The project uses Supabase's free tier with connection pooling. Use `DATABASE_URL` for Prisma queries (pooled) and `DIRECT_URL` for migrations.

## Architecture

### Directory Structure

```
app/
  (main)/              # Public-facing pages (route group)
    page.tsx           # Homepage - movie grid/list view
    calendar/          # Calendar view for movie screenings
    reviews/
      new/             # Create new review
      [id]/            # View individual review
  actions/             # Server Actions
    review.ts          # Review CRUD operations
    tmdb.ts            # TMDB API wrapper actions
    tag.ts             # Tag management
  api/                 # API route handlers
    reviews/           # REST endpoints if needed
  layout.tsx           # Root layout with Header
  globals.css          # Tailwind config + custom styles

components/
  ui/                  # Reusable UI primitives
    glass-card.tsx     # Glassmorphism card component
    star-rating.tsx    # Interactive star rating
    badge.tsx          # Tag/badge component
  movies/              # Movie-specific components
    movie-card.tsx     # Grid view card
    movie-list-item.tsx # List view item
  reviews/             # Review-related components
    review-form.tsx    # Main review creation form
    movie-search.tsx   # TMDB movie search interface
    tag-picker.tsx     # Tag selection UI
  editor/              # Rich text editor
    review-editor.tsx  # Tiptap editor wrapper
    extensions/        # Custom Tiptap extensions
  shared/
    header.tsx         # Global navigation header
  calendar/
    month-view.tsx     # Calendar component

lib/
  db/
    client.ts          # Prisma singleton with pg adapter
  validations/
    review.ts          # Zod schemas for form validation
  tmdb.ts              # TMDB API client functions
  utils.ts             # Utility functions (cn, etc.)
  mock-data.ts         # Development mock data

prisma/
  schema.prisma        # Database schema
  migrations/          # Migration history
```

### Key Architectural Patterns

**Server Components by Default**: All components are Server Components unless marked `"use client"`. Client components are only used for:
- Forms with interactivity (`review-form.tsx`)
- Search interfaces (`movie-search.tsx`)
- Interactive UI (`star-rating.tsx`, `tag-picker.tsx`)
- Rich text editor (`review-editor.tsx`)

**Server Actions for Mutations**: Data mutations use Server Actions (`app/actions/`) with:
- Zod validation before database operations
- Automatic revalidation via `revalidatePath()`
- Server-side redirects after successful operations

**Database Connection Pattern**:
- Prisma client uses PostgreSQL adapter with connection pooling
- Singleton pattern in `lib/db/client.ts` prevents multiple instances
- `globalThis` caching in development for hot reload support

**TMDB Integration**:
- Movie metadata fetched from TMDB API
- Poster images served through TMDB CDN (`image.tmdb.org`)
- Next.js Image component configured for TMDB hostname
- Director info extracted from credits API response

## Database Schema

### Core Models

**Review** - Movie review entries
- `id`, `title`, `director`, `posterUrl`, `tmdbId`
- `rating` (0.5-5.0 scale), `oneLiner`, `content` (rich text)
- `watchedAt`, `isMustWatch` (Dotchelin badge)
- Many-to-many relationship with `Tag`

**Tag** - Categorization tags
- `id`, `name` (unique), `color` (hex code)
- Many-to-many with `Review` via `ReviewTags` relation

**CalendarEvent** - Screening schedule
- `id`, `title`, `startDate`, `endDate`
- `type` ("SCREENING" | "WATCHED")

**User** - Authentication (future use)
- `id`, `email`, `password` (hashed)

### Database Operations

```typescript
// Create review with tags
await prisma.review.create({
  data: {
    ...reviewData,
    tags: {
      connectOrCreate: tags.map(tag => ({
        where: { name: tag },
        create: { name: tag }
      }))
    }
  }
});
```

## Design System

### Theme Configuration

**Signature Color**: Pale Blue (`#95B9DB`)
- CSS variable: `--color-padot-blue`
- Tailwind: `padot-blue-{50-600}` scale defined in `globals.css`

**Design Philosophy**:
- Modern, premium glassmorphism aesthetic
- High-quality UI with meaningful micro-animations
- Cute but clean/modern (target: female VTuber audience)
- Dark mode support via Tailwind's `dark:` variants

### Glassmorphism Pattern

```css
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Dark mode */
.dark .glass {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Custom Animations

```css
animate-fade-in    /* 0.5s fade in */
animate-slide-up   /* 0.5s slide up with fade */
```

## Coding Conventions

### Naming
- **Components**: PascalCase (`MovieCard`, `ReviewForm`)
- **Functions/Variables**: camelCase (`searchMovies`, `filterRating`)
- **Files**: kebab-case for components (`movie-card.tsx`), camelCase for utilities (`tmdb.ts`)
- **Database fields**: snake_case in Prisma schema, mapped to camelCase in TypeScript

### Route Organization
- Use Next.js 16 App Router route groups: `(main)`, `(auth)`, `(dashboard)`
- Groups organize routes without affecting URL structure
- Public pages in `(main)`, admin features in `(dashboard)` (future)

### TypeScript
- Strict mode enabled (`"strict": true`)
- Path alias `@/*` maps to project root
- Target: ES2017
- Zod for runtime type validation on server boundaries

### Form Handling Pattern

```typescript
// 1. Define Zod schema
export const reviewSchema = z.object({
  title: z.string().min(1, "영화 제목은 필수입니다."),
  rating: z.number().min(0).max(5).step(0.5),
  // ... other fields
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// 2. Client component with react-hook-form
const form = useForm<ReviewFormValues>({
  resolver: zodResolver(reviewSchema),
  defaultValues: { /* ... */ }
});

// 3. Server action with validation
export async function submitReview(data: ReviewFormValues) {
  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "..." };
  }

  // Database operation
  const review = await prisma.review.create({ ... });

  revalidatePath("/reviews");
  redirect(`/reviews/${review.id}`);
}
```

### Image Optimization

- Use `next/image` for all images
- TMDB images configured in `next.config.ts`:
  ```typescript
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'image.tmdb.org'
    }]
  }
  ```
- Local images in `/public` (e.g., `dotchelin-badge.png`)

## Important Notes

### Language
All user-facing text and error messages must be in **Korean**.

### Supabase Free Tier Considerations
- Connection pooling is critical (use `DATABASE_URL` with port 6543)
- Database pauses after inactivity - consider warming queries
- Connection limit: Use Prisma's connection pooling effectively

### TMDB API
- API key required for all requests
- Language parameter: `ko-KR` for Korean content
- Image base URL: `https://image.tmdb.org/t/p/w500`
- Rate limits apply - cache responses when possible

### Performance Considerations
- Server Components render on server - no client-side JS
- `"use client"` only when needed (forms, interactive UI)
- Images from TMDB use Next.js Image optimization
- Tailwind CSS v4 uses PostCSS for optimal bundle size
