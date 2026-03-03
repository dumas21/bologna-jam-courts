# CLAUDE.md — Bologna Jam Courts

This file provides AI assistants (Claude Code and others) with essential context about the project structure, conventions, and workflows.

---

## Project Overview

**Playground Jam Bologna** is a web app to discover, rate, and manage basketball courts ("playgrounds") in Bologna, Italy. It features user authentication, real-time chat, event tracking, check-ins, ratings, an admin panel, and an interactive map.

- **Stack:** React 18 + TypeScript + Vite + Supabase + TailwindCSS + shadcn/ui
- **Theme:** 80s arcade / NBA Jam aesthetic throughout all UI
- **Language:** UI is in Italian; code and comments are in English
- **Lovable project URL:** https://lovable.dev/projects/d01073df-498e-488b-be4b-ef189a39047d

---

## Repository Structure

```
bologna-jam-courts/
├── src/
│   ├── App.tsx                  # Root component — all routes defined here
│   ├── main.tsx                 # Entry point — audio context init, React mount
│   ├── index.css                # Global styles (arcade theme, scanlines, fonts)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (Button, Dialog, etc.)
│   │   ├── admin/               # Admin panel components
│   │   ├── auth/                # Auth-related components
│   │   ├── chat/                # Chat UI components
│   │   └── *.tsx                # Feature components (PlaygroundCard, LeafletMap, etc.)
│   ├── pages/                   # One file per route/page
│   ├── hooks/                   # Custom React hooks (usePlaygrounds, useAuth, etc.)
│   ├── types/                   # TypeScript type definitions
│   │   ├── playgroundTypes.ts   # Core domain types
│   │   └── auth.ts              # Auth-specific types
│   ├── data/
│   │   └── playgroundData.ts    # Hardcoded list of 15+ Bologna playgrounds
│   ├── services/
│   │   └── authService.ts       # Auth business logic
│   ├── integrations/supabase/
│   │   ├── client.ts            # Supabase client
│   │   └── types.ts             # Auto-generated DB types (do not edit manually)
│   ├── utils/
│   │   ├── security.ts          # sanitizeHTML, validateNickname, EnhancedRateLimiter
│   │   ├── rateLimiting.ts      # Rate limiter utility
│   │   ├── secureStorage.ts     # Safe localStorage helpers
│   │   └── timeUtils.ts         # Daily reset, 48h chat timer helpers
│   ├── config/                  # App-level config constants
│   └── lib/                     # Generic utility functions
├── supabase/
│   ├── config.toml              # Supabase local dev config
│   ├── functions/               # 3 Deno edge functions
│   │   ├── send-custom-auth-email/
│   │   ├── contact-submit/
│   │   └── newsletter-submit/
│   └── migrations/              # 21 SQL migration files
├── public/
│   ├── sounds/                  # Audio effects (arcade sounds)
│   └── lovable-uploads/         # Uploaded media assets
├── .github/workflows/webpack.yml
├── capacitor.config.ts          # Mobile (iOS/Android) config
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── components.json              # shadcn/ui config
```

---

## Development Workflows

### Running the Dev Server

```bash
npm install
npm run dev          # Starts Vite dev server on http://localhost:8080
```

### Building for Production

```bash
npm run build        # Production build → dist/
npm run preview      # Preview the production build locally
```

### Linting

```bash
npm run lint         # ESLint with TypeScript + React Hooks rules
```

### No Test Suite

There is currently no test framework configured. The CI workflow (`webpack.yml`) runs `npm test` but exits gracefully when no tests are found.

---

## Environment Variables

The app uses Supabase. Required `.env` variables (prefixed with `VITE_` for Vite):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

These are accessed via `import.meta.env.VITE_SUPABASE_URL` etc. Never commit secrets; the `.env` file is gitignored.

---

## Routing

All routes are defined in `src/App.tsx`. Key routes:

| Path | Page | Notes |
|------|------|-------|
| `/` | `Index` | Main playground list |
| `/stats` | `Stats` | Usage statistics |
| `/events` | `Events` | Events listing |
| `/add` | `AddPlayground` | Submit new playground |
| `/login` | `Login` | Auth login |
| `/register` | `Register` | User registration |
| `/profile` | `Profile` | User profile |
| `/admin` | `Admin` | Admin dashboard (protected) |
| `/auth/callback` | `AuthCallback` | OAuth callback handler |
| `/privacy-policy` | `PrivacyPolicy` | |
| `*` | `NotFound` | 404 fallback |

---

## State Management

- **Local state:** React `useState` / `useReducer` inside components
- **Server state:** TanStack Query (React Query v5) for Supabase data fetching
- **Persistence:** `localStorage` for check-in history, playground cache, chat reset timers
- **Auth state:** Supabase Auth, wrapped in `useAuth` / `useAuthState` hooks
- **Global providers:** `QueryClientProvider`, `TooltipProvider`, `BrowserRouter` — all in `App.tsx`

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `usePlaygrounds` | Load playgrounds, check-ins, ratings |
| `useAuth` | Supabase auth wrapper |
| `useAuthState` | Track authentication state |
| `useCheckIn` | Check-in / checkout logic |
| `useFavorites` | Favorite playground management |
| `useRatings` | Star ratings |
| `usePlaygroundMessages` | Per-playground chat messages |
| `useChatSounds` | Chat notification sounds |
| `useAudioEffects` | Arcade sound effects |
| `use-mobile` | Responsive/mobile detection |

---

## Supabase Integration

### Client

`src/integrations/supabase/client.ts` exports the initialized Supabase client. Import from there — do not create new clients.

### Types

`src/integrations/supabase/types.ts` is **auto-generated** from the Supabase schema. Do not edit manually. Regenerate with the Supabase CLI when schema changes.

### Database Tables

- `profiles` — User profiles (id, nickname, email, is_admin, created_at, updated_at)
- `playground_messages` — Chat messages with rate limiting
- Additional tables for playgrounds, ratings, events, check-ins (see migrations)

### Edge Functions

Located in `supabase/functions/`. Written in TypeScript for Deno runtime:
- `send-custom-auth-email` — Transactional auth emails
- `contact-submit` — Contact form (requires JWT)
- `newsletter-submit` — Newsletter subscriptions

### Migrations

Sequential SQL files in `supabase/migrations/`. 21 migrations total. Never modify existing migrations; always add new ones.

---

## Coding Conventions

### TypeScript

- **Path alias:** `@/*` maps to `src/*` (e.g., `import { Playground } from "@/types/playgroundTypes"`)
- Strict mode is **disabled** (`"strict": false` in tsconfig) — avoid adding unnecessary `any`, but don't fight the compiler
- Interfaces preferred over types for object shapes
- Auto-generated types in `integrations/supabase/types.ts` — use the `Database` type for Supabase queries

### React

- **Functional components only** with hooks
- PascalCase filenames for components: `PlaygroundCard.tsx`
- camelCase filenames for hooks: `usePlaygrounds.tsx`
- One component per file (except small local helper components)
- shadcn/ui primitives from `src/components/ui/` — use these before reaching for third-party components

### Styling

- **Tailwind CSS** utility classes — the primary styling approach
- Custom theme colors via `jam.*` palette (defined in `tailwind.config.ts`):
  - `jam.purple` `#9b87f5`, `jam.orange` `#F97316`, `jam.blue` `#0EA5E9`
  - `jam.pink` `#D946EF`, `jam.dark` `#1A1F2C`, `jam.yellow` `#FBBF24`
  - `jam.neon-orange` `#FF6B35`, `jam.neon-yellow` `#FFD23F`
- **Arcade/80s aesthetic** must be maintained — glowing borders, neon colors, pixelated fonts
- Custom fonts: `Press Start 2P`, `Orbitron`, `Exo 2`, `Bebas Neue`, etc.
- Avoid overriding global styles in `index.css` — all text is forced white for contrast
- Dark mode is class-based but the theme is inherently dark

### Security

Always use utilities from `src/utils/security.ts` for user-generated content:
- `sanitizeHTML(html)` — DOMPurify with strict config for any rendered HTML
- `sanitizeText(text)` — Strip script tags and dangerous patterns from plain text
- `validateNickname(nick)` — Alphanumeric + limited specials, 3–20 chars
- `validatePlaygroundName(name)` — 3–100 chars
- `validateContentLength(text, max)` — Length guard
- `EnhancedRateLimiter` — Use for any action that could be spammed

Never trust user input without validation. Sanitize before rendering. Use Zod for schema validation on forms.

### File Organization

- New **page** → add to `src/pages/`, register route in `src/App.tsx`
- New **reusable component** → `src/components/`
- New **shadcn primitive** → `src/components/ui/` (via shadcn CLI, do not handwrite)
- New **custom hook** → `src/hooks/`
- New **type/interface** → `src/types/`
- New **utility function** → `src/utils/`
- New **Supabase edge function** → `supabase/functions/<name>/index.ts`
- New **database change** → new migration file in `supabase/migrations/`

---

## Audio & Multimedia

- Audio files live in `public/sounds/`
- `src/main.tsx` initializes AudioContext on first user interaction (required for browsers/iOS)
- The `useAudioEffects` and `useChatSounds` hooks manage playback
- Do not block the main thread with audio operations — keep them async

---

## Admin Panel

- Route: `/admin` (protected — requires `is_admin: true` on user profile)
- Components in `src/components/admin/`:
  - `AdminUsers.tsx` — User management
  - `AdminMessages.tsx` — Message moderation
  - `AdminEvents.tsx` — Event management
  - `AdminPlaygrounds.tsx` — Playground CRUD
- Admin access controlled by Supabase RLS policies

---

## Mobile (Capacitor)

- `capacitor.config.ts` configures iOS/Android packaging
- Run `npx cap sync` after building to update native projects
- `use-mobile` hook detects mobile viewport for responsive adjustments

---

## CI/CD

- GitHub Actions: `.github/workflows/webpack.yml`
- Triggers: push to `main`, PR to `main`, manual dispatch
- Matrix: Node 18, 20, 22
- Steps: checkout → setup Node → `npm install` → `npx webpack` → `npm test`
- No tests currently configured; pipeline continues without them

---

## Common Pitfalls

1. **Do not edit `src/integrations/supabase/types.ts` manually** — it's auto-generated
2. **Do not create new Supabase clients** — always import from `src/integrations/supabase/client.ts`
3. **Do not modify existing migration files** — always add new ones
4. **Always sanitize user input** before rendering or storing — use `src/utils/security.ts`
5. **Maintain the arcade theme** — new UI should use `jam.*` color tokens and arcade-style typography
6. **Playground data is hardcoded** in `src/data/playgroundData.ts` — any new courts should be added there and/or synced to the database
7. **localStorage keys:** `playgroundData`, `checkInRecords`, `lastChatReset` — document any new keys added
8. **Check-in counts reset daily at 23:59**; chat messages reset every 48 hours — see `src/utils/timeUtils.ts`
