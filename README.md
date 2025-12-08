# 🐛 Padot Movie Awards (송충이 어워즈)

**Padot Movie Awards** is a visually rich, interactive movie review archive application built with Next.js 15. It allows users to document their movie-watching journey with detailed reviews, ratings, and a personalized graphical interface.

![Project Preview](/placeholder-poster.png) *<!-- Replace with actual screenshot if available -->*

## ✨ Key Features

### 🎬 Review Management
-   **Rich Text Editor**: Write comprehensive reviews using a custom **Glassmorphism Tiptap Editor** with formatting support.
-   **Star Ratings & Badges**: Rate movies from 0.0 to 5.0 and award the special **"Dotchelin" (Must Watch)** badge.
-   **One-Liners**: Add impactful one-line summaries for each movie.
-   **Tagging System**: Organize movies with colorful, custom tags (e.g., "Horror", "Comedy", "Masterpiece").

### 🎨 Immersive UI/UX
-   **Glassmorphism Design**: A premium, translucent aesthetic applied to cards, toolbars, and editors.
-   **Dynamic Views**:
    -   **Grid View**: Visual-first gallery with poster art.
    -   **List View**: Organized, groupings by **Star Rating** with collapsible headers.
-   **Interactive Elements**: Smooth hover effects (Poster Blur), animated transitions, and custom cursors.
-   **Dark Mode**: Optimized for a cinematic viewing experience.

### 🔍 Powerful Filtering
-   **Multi-Tag Search**: Filter reviews by selecting multiple tags (OR logic).
-   **Rating Filters**: Quickly find top-rated movies.
-   **Infinite Scroll**: Seamless browsing of large review collections.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Editor**: [Tiptap](https://tiptap.dev/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Planned/In-progress)

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   PostgreSQL database

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/LookerKy/padot-movie-talk.git
    cd padot-movie-talk
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/padot_movie_awards"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router
│   ├── (main)/           # Public layout & pages
│   ├── actions/          # Server Actions (Backend logic)
│   └── api/              # API Routes
├── components/           # React Components
│   ├── reviews/          # Review-feature specific components
│   ├── movies/           # Movie cards & list items
│   ├── editor/           # Tiptap Editor config
│   └── ui/               # Reusable UI components (Shadcn)
├── lib/                  # Utilities, DB client, Auth config
├── prisma/               # Database Schema
└── store/                # Global State (Zustand)
```

## 📝 License

This project is licensed under the MIT License.
