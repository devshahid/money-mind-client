# Migration Documentation — Phase 1 & Phase 2

**Branch:** `refactor/production-ready-architecture` **Date:** April 2026 **Scope:** 181 files changed (91 added, 75 deleted, 9 modified, 6 renamed)

---

## Phase 1 — Structural Fixes & Foundation

### 1.1 Router moved to module level

**Problem:** The `createBrowserRouter` call was inside the `App` component body, meaning a new router instance was created on every render. This is a React Router anti-pattern that causes unnecessary re-renders and can break navigation state.

**Fix:** Extracted the router to `src/router.tsx` as a module-level constant. The `App` component now simply renders `<RouterProvider router={router} />`.

**Files:**

- `src/router.tsx` — New file, module-level router definition
- `src/App.tsx` — Simplified to import and render the router

### 1.2 Centralized route paths

**Problem:** Route path strings were hardcoded across `App.tsx`. Typos in route strings cause silent failures, and changing a route requires editing multiple files.

**Fix:** Created `src/routes/paths.ts` with an `AppRoute` constant object. All route references now use `AppRoute.Transactions` instead of `'/transactions'`.

```ts
// src/routes/paths.ts
export const AppRoute = {
  Root: '/',
  Dashboard: '/',
  Transactions: '/transactions',
  Debts: '/debts',
  Goals: '/goals',
  Budget: '/budget',
  Analytics: '/analytics',
  AIChat: '/ai-chat',
  Settings: '/settings',
  Account: '/account',
  Login: '/login',
  Register: '/register',
  NotFound: '*',
} as const
```

### 1.3 Centralized API routes

**Problem:** API endpoint strings were scattered across service files and store slices.

**Fix:** Created `src/routes/api-routes.ts` with an `API_ROUTES` constant object. All API calls now reference `API_ROUTES.transactionLogs.list` instead of `'/transaction-logs/list-transactions'`.

**Files:**

- `src/routes/api-routes.ts` — New file, all backend API endpoints
- `src/routes/index.ts` — Barrel export for routes

### 1.4 Barrel index.ts exports

**Problem:** Every import was a direct file path (`./components/GroupDialog.tsx`), creating tight coupling to file locations.

**Fix:** Added `index.ts` barrel files to every folder, providing a stable public API per module.

**Barrel files created:**

- `src/features/*/index.ts` — One per feature
- `src/features/index.ts` — Top-level feature barrel
- `src/shared/index.ts` — Shared module barrel
- `src/layouts/index.ts` — Layouts barrel
- `src/routes/index.ts` — Routes barrel

### 1.5 Default exports converted to named exports

**Problem:** Default exports make refactoring harder — renaming on import disconnects the symbol name from the file. IDE refactoring tools work better with named exports.

**Fix:** Converted every `export default` in `src/` to a named export. Updated all consuming imports from `import X from '...'` to `import { X } from '...'`.

**Scope:** 40+ files converted. Zero `export default` statements remain in `src/`.

**Store slices specifically:**

- `export default authSlice.reducer` → `export const authReducer = authSlice.reducer`
- Same pattern for all 7 slices
- `src/store/index.ts` updated to use `import { authReducer } from '...'`

### 1.6 Lazy-loaded routes for code splitting

**Problem:** All page components were eagerly imported, meaning the entire app loaded upfront regardless of which page the user visits.

**Fix:** All page routes now use React Router's `lazy()` API for code splitting. Each page is loaded on demand.

```ts
const LazyDashboard = async (): Promise<{ Component: React.ComponentType }> => {
  const { DashboardPage } = await import('./features/dashboard/pages/Dashboard')
  return { Component: DashboardPage }
}
```

**Result:** Production build now generates separate chunks per page (Dashboard 16KB, TransactionLogs 645KB, Login 3.9KB, etc.).

### 1.7 Prettier config updated

**Before:**

- 4-space indent, semicolons, double quotes, 150 char width

**After:**

- 2-space indent, no semicolons, single quotes, 120 char width, arrow parens avoided

```json
{
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "jsxSingleQuote": true,
  "printWidth": 120,
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

All files reformatted to match.

### 1.8 ESLint errors and warnings resolved

**3 errors fixed:**

- `src/App.tsx` — Unsafe `any` assignment from `JSON.parse()` → proper `as` type assertion
- `src/features/auth/pages/Login.tsx` — Unescaped `'` in JSX → `&apos;`
- `src/router.tsx` — `async` function without `await` → `Promise.resolve()`

**33 warnings fixed:**

- 20 missing return types → Added explicit `: JSX.Element` and `: void` return types
- 13 react-refresh warnings → Added `eslint-disable` comments for context files that co-locate providers and hooks (standard React pattern)

**Final state:** 0 errors, 0 warnings from ESLint.

---

## Phase 2 — Feature-Based Architecture

### 2.1 Architecture overview

**Before (flat structure):**

```
src/
├── components/     ← 30+ files, mixed domains
├── pages/          ← Route-level containers
├── store/          ← All Redux slices together
├── services/       ← All API services together
├── types/          ← All type definitions together
├── utils/          ← All utilities together
├── contexts/       ← All React contexts together
├── hooks/          ← All custom hooks together
└── helpers/        ← IndexedDB helpers
```

**After (feature-based structure):**

```
src/
├── features/
│   ├── account/          ← Account management
│   ├── ai-chat/          ← AI chat & suggestions
│   ├── analytics/        ← Analytics & charts
│   ├── auth/             ← Authentication
│   ├── budget/           ← Budget tracking
│   ├── dashboard/        ← Dashboard & summary
│   ├── debts/            ← Debt & EMI tracking
│   ├── goals/            ← Financial goals
│   └── transactions/     ← Transaction logs, groups, splits
├── shared/               ← Cross-cutting concerns
│   ├── components/       ← Reusable UI (CustomModal, GlobalSnackbar)
│   ├── contexts/         ← App-wide contexts (Theme, Layout, Snackbar)
│   ├── hooks/            ← Typed Redux hooks
│   ├── services/         ← Axios client
│   └── utils/            ← General utilities
├── layouts/              ← App shell (Header, Sidebar, Footer)
├── routes/               ← Route paths & API routes
├── store/                ← Redux store configuration
├── constants/            ← App-wide constants
└── assets/               ← Static assets
```

### 2.2 Feature folder structure

Each feature follows a consistent internal structure:

```
features/<feature-name>/
├── components/     ← Feature-specific UI components
├── pages/          ← Route-level page components
├── store/          ← Redux slice(s)
├── services/       ← API service functions
├── types/          ← TypeScript type definitions
├── utils/          ← Pure utility functions
├── hooks/          ← Feature-specific hooks
├── helpers/        ← Feature-specific helpers (e.g., IndexedDB)
└── index.ts        ← Barrel export (public API)
```

Not every feature has every subfolder — only what's needed.

### 2.3 Feature breakdown

| Feature      | Pages | Components | Store | Services | Types | Utils | Helpers |
| ------------ | ----- | ---------- | ----- | -------- | ----- | ----- | ------- |
| account      | 1     | —          | —     | —        | —     | —     | —       |
| ai-chat      | 1     | 2          | 1     | 1        | 1     | —     | —       |
| analytics    | 1     | —          | —     | —        | —     | —     | —       |
| auth         | 2     | 2          | 1     | 1        | —     | 1     | —       |
| budget       | 1     | —          | —     | —        | 1     | 1     | —       |
| dashboard    | 1     | 3          | —     | —        | —     | —     | —       |
| debts        | 1     | 2          | 1     | 1        | 1     | 1     | —       |
| goals        | 1     | 2          | 1     | 1        | 1     | 1     | —       |
| transactions | 1     | 14         | 3     | 2        | 3     | 3     | 3       |

### 2.4 Shared module

Files used by multiple features live in `src/shared/`:

| File                            | Purpose                                   | Used by                          |
| ------------------------------- | ----------------------------------------- | -------------------------------- |
| `components/CustomModal.tsx`    | Reusable modal wrapper                    | transactions, goals              |
| `components/GlobalSnackbar.tsx` | App-wide notification                     | main.tsx                         |
| `components/SnackBar.tsx`       | Snackbar component                        | GlobalSnackbar                   |
| `contexts/LayoutContext.tsx`    | Header height state                       | TransactionControls              |
| `contexts/SnackBarContext.tsx`  | Snackbar notifications                    | Multiple features                |
| `contexts/ThemeContext.tsx`     | Light/dark mode toggle                    | Sidebar, Table, StatementPreview |
| `hooks/slice-hooks.ts`          | Typed `useAppDispatch` / `useAppSelector` | All features                     |
| `services/axiosClient.ts`       | Axios instance with auth interceptor      | All services                     |
| `utils/common.ts`               | Color utilities, string helpers           | Header, layouts                  |

### 2.5 Files deleted

75 files deleted from old locations after being moved to `features/` or `shared/`:

- **10 pages** — `src/pages/*.tsx` → `src/features/*/pages/`
- **7 store slices** — `src/store/*Slice.ts` → `src/features/*/store/`
- **7 services** — `src/services/*.ts` → `src/features/*/services/` or `src/shared/services/`
- **7 types** — `src/types/*.ts` → `src/features/*/types/`
- **9 utils** — `src/utils/*.ts` → `src/features/*/utils/` or `src/shared/utils/`
- **3 helpers** — `src/helpers/indexDB/*.ts` → `src/features/transactions/helpers/`
- **3 contexts** — `src/contexts/*.tsx` → `src/shared/contexts/`
- **2 hooks** — `src/hooks/*.ts` → `src/shared/hooks/` or `src/features/auth/hooks/`
- **20+ components** — `src/components/**/*.tsx` → `src/features/*/components/` or `src/shared/components/`
- **7 barrel files** — Old `index.ts` files from deleted directories

### 2.6 Import conventions

After the migration, imports follow this pattern:

```ts
// External packages first
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

// Shared modules (cross-cutting)
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { useSnackbar } from '../../../shared/contexts/SnackBarContext'

// Feature-internal imports (same feature)
import { listDebts } from '../store/debtSlice'
import { DebtTable } from '../components/Debt'

// Root-level imports
import { RootState } from '../../../store'
import { AppRoute } from '../../../routes'
```

---

## Verification

| Check              | Result                       |
| ------------------ | ---------------------------- |
| `npx tsc --noEmit` | ✅ 0 errors                  |
| `npx eslint src/`  | ✅ 0 errors, 0 warnings      |
| `npx vite build`   | ✅ Built in ~10s             |
| Code splitting     | ✅ 14 separate chunks        |
| No default exports | ✅ Zero in `src/`            |
| No duplicate files | ✅ All old copies deleted    |
| No double exports  | ✅ Each symbol exported once |

---

## What's next — Phase 3

Phase 3 will add:

1. Zod schemas for API response validation
2. ESLint import ordering plugin (`eslint-plugin-import`)
3. Centralized query keys enum
