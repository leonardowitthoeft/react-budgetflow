# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BudgetFlow** is a personal budget management web application. The frontend is a React + TypeScript + Vite application that manages monthly cash flow and expenditure tracking.

- **Language**: Portuguese (Brazilian) — UI text, comments, and variable names are in Portuguese
- **Backend API**: Runs on `http://localhost:8080` (proxied via Vite dev server)
- **Authentication**: Token-based (Bearer token, 15-minute session per tab)

## Development Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # TypeScript type-check + Vite build → dist/
npm run lint      # Run ESLint on all .ts/.tsx files
npm run preview   # Preview production build locally
```

## Architecture

### Entry Points
- `src/main.tsx` — React root, mounts App component
- `src/App.tsx` — Main component tree (authentication, layout, routing between pages)

### Key Components

**Authentication**
- `Entrada` component: Login/signup form. Calls `api.entrar()` or `api.registrar()` and `api.provisionar()` for new users
- Session stored in memory via `token` variable in `api.ts` — lost on page reload

**Main Application**
- `Aplicativo` component: Sidebar + tabbed interface
  - **Razão** tab: Ledger/entries view (uses `EntriesPage`)
  - **Painel** tab: Dashboard (not yet implemented)

**Pages**
- `EntriesPage.tsx` — Monthly entries list, create/edit/delete entries, mark as paid
- `EntryForm.tsx` — Form for creating/editing budget entries

### API Layer

**`src/api.ts`** — Centralized API client with:
- `requisitar<T>()` — Generic fetch wrapper handling headers, errors, and 204 responses
- `token` module variable — Stores Bearer token; managed by `definirToken()`
- Typed DTOs mirroring backend:
  - `Category`, `Subcategory` — Budget taxonomy
  - `Entry` — Individual transaction (with installment support)
  - `NovoLancamento` — Request body for creating entries
  - `Lookups` — Accounts and payment methods
- `ApiError` class — Preserves HTTP status for 401 (session expired) vs. 400 (user error) handling

**API Endpoints** (all under `/api`):
- POST `/auth/login`, `/auth/register` — Authentication
- GET `/categories`, POST `/categories/provision` — Category taxonomy
- GET `/lookups` — Accounts and payment methods
- GET/POST/PATCH/DELETE `/entries` — Entry CRUD

## Code Patterns

### Token Management
- Token is global state in `api.ts`; there is no React context or state manager
- Components communicate token updates via `definirToken(null)` to log out
- Each request automatically includes `Authorization: Bearer ${token}` header

### Error Handling
- Distinguish `ApiError` (with `status` property) from generic `Error`
- 401 errors trigger re-authentication; other errors are shown to the user
- Always check `resposta.ok` after `fetch()` — it doesn't throw on bad status codes

### TypeScript Strictness
- `tsconfig.app.json`: ES2023 target, bundler module resolution, JSX via React 19
- Enabled: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Types are source of truth for backend contract — mismatches surface at compile or first API call

### React & Hooks
- Functional components only; hooks for state
- React 19.2.8 with refresh plugin for HMR in dev
- No state manager (Redux, Zustand, etc.) — lift state as needed

## Development Notes

- **Vite Proxy**: Dev server proxies `/api/*` to `http://localhost:8080`, avoiding CORS in development
- **No Tests**: Project has no test files or test runner configured
- **No CSS Framework**: Custom CSS (implied by class names like `btn-primario`, `entrada`, `layout`)
- **Installments & Recurring**: API supports these via `repeticao`, `totalParcelas`, etc. in `NovoLancamento`; UI implementation may be partial
- **Backend Required**: Frontend requires a running backend on port 8080 to function

## Common Workflows

**Add a new API endpoint**:
1. Define the request/response types in `api.ts` (mirror backend DTOs)
2. Add a new method to the `api` object
3. Call from components, catching `ApiError` as needed

**Add a new page**:
1. Create a new `.tsx` component
2. Add tab button in `Aplicativo` and conditional render
3. Query data via `api.categorias()`, `api.lookups()`, etc.

**Debug API calls**:
- Check browser DevTools Network tab (requests go through Vite proxy)
- Ensure backend is running on `localhost:8080`
- Verify token is set via `api.ts` module scope (log in first)
