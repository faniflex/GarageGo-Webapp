# GarageGo — Webapp

A Vite + React + TypeScript frontend for the GarageGo marketplace (client-only repository).

This README provides a comprehensive guide to setting up, running, developing, and deploying the project locally. It includes notes about authentication, Supabase integration, routing, and mobile-specific behaviors.

Table of contents
- Overview
- Features
- Tech stack
- Prerequisites
- Getting started (local development)
- Environment variables
- Running, building, previewing
- Linting & testing
- Supabase integration & database notes
- Routing and pages
- Project structure and conventions
- Mobile behavior and accessibility notes
- Troubleshooting
- Contributing

---

Overview
--------

GarageGo is a client-side web application that lists garages and spare parts, allows browsing details, and connects to a Supabase backend for authentication and persistency. The repo includes mock data in `src/data/mockData.ts` so core UI flows are usable without backend setup.

Features
--------

- Browse and search garages
- Browse and view spare parts
- Garage detail pages with reviews
- Spare part detail pages
- Authentication via Supabase (email-based)
- Responsive layout with a mobile bottom navigation and desktop top navigation
- Theme toggle (light/dark)

Tech stack
----------

- Vite (development server and build)
- React + TypeScript
- Tailwind CSS + tailwind-merge
- Radix UI primitives + shadcn-style components
- Supabase (optional backend)
- React Router for routing
- TanStack Query for client-side fetching
- Vitest for tests

Prerequisites
-------------

- Node.js 18+ (use nvm / nvm-windows to manage versions)
- npm (or pnpm / yarn)
- Optional: Supabase project if you want to use real backend data

Getting started (local development)
---------------------------------

1. Clone the repository and enter the folder:

```bash
git clone <YOUR_GIT_URL>
cd GarageGo-Webapp
```

2. Install dependencies:

```bash
npm install
# or: pnpm install
```

3. (Optional) Configure environment variables (see Environment section).

4. Start the dev server:

```bash
npm run dev
```

Open the URL printed by Vite (typically http://localhost:5173).

Environment variables
---------------------

If you plan to use Supabase, create a `.env.local` file in the project root with the following keys:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=public-anon-key
```

Notes
- The app falls back to mock data from `src/data/mockData.ts` when env vars are not provided or Supabase is not reachable.
- Never commit private or service role keys.

Running, building, previewing
-----------------------------

- `npm run dev` — run local dev server (auto reload)
- `npm run build` — build optimized production assets
- `npm run preview` — preview production build locally

Linting & testing
-----------------

- `npm run lint` — run ESLint across the repo
- `npm run test` — run tests with Vitest

Supabase integration & database notes
-----------------------------------

- The Supabase client is initialized at `src/integrations/supabase/client.ts` and reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Typical tables expected by the app (example): `garages`, `spare_parts`, `reviews`, `users`. The SQL migration files (if any) live under `supabase/migrations/` in this repo — review them to see schema structure.
- Authentication: this app uses Supabase Auth for session handling. Sessions are persisted to localStorage by the Supabase JS client (configured in `client.ts`).
- Policies / RLS: ensure Row Level Security policies allow the operations your UI performs (select, insert for reviews, etc.). In development, you can relax RLS, but for production enable proper policies.

Routing and pages
-----------------

Main routes (see `src/App.tsx`):
- `/` — Home / landing page
- `/garages` — Garages list and search
- `/garages/:id` — Garage detail
- `/spare-parts` — Spare parts list
- `/spare-parts/:id` — Spare part detail
- `/dashboard` — User dashboard (requires auth)
- `/profile` — Profile page
- `/settings` — Settings page
- `/auth` — Authentication (sign-in / sign-up)

Project structure and conventions
-------------------------------

- `src/components/` — shared UI building blocks (cards, nav, UI primitives)
- `src/pages/` — route-level components (one per route)
- `src/data/mockData.ts` — fallback data used when Supabase is not configured
- `src/lib/` — small utilities (theme init, helpers)

Styling and theme
-----------------

- Tailwind CSS with utility-first classes drives the UI.
- The theme is toggled using `src/lib/theme.ts` (applies `dark` class on `<html>`).

Mobile behavior and accessibility notes
-------------------------------------

- On small screens the top header is hidden and a mobile bottom navigation is shown instead.
- The Settings and Auth CTAs are accessible from the mobile UI (Home/Settings pages) because the desktop top navigation is hidden on small screens.
- Keyboard and assistive-labels: interactive icons include `aria-label` when needed; add further ARIA attributes if you adjust components.

Troubleshooting
---------------

- Syntax errors in JSX: check for unclosed tags or improperly nested fragments.
- Vite errors about CSS `@import`: ensure `@import` rules appear before other Tailwind directives in CSS entry files.
- Supabase auth not persisting: verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are correct and CORS settings allow your dev origin.

Contributing
------------

If you plan to contribute, please follow these conventions:

- Run `npm run lint` and `npm run test` before opening a PR.
- Keep changes focused and create small, reviewable commits.
- Update `src/data/mockData.ts` when adding new UI that needs demo content.

Optional extras I can add for you
--------------------------------

- `.env.example` file with env var names
- A short CI workflow (GitHub Actions) that runs lint and tests
- Seed script and example SQL to populate the Supabase dev DB

If you want one of those, tell me which and I'll add it.

---

If anything in this README should be expanded (API docs, schema diagrams, dev tips), tell me which section and I will extend it.

