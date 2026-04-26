# Tech Stack & Build System

## Core Stack

- **Language**: TypeScript (strict mode enabled)
- **Framework**: React 18 with react-router-dom v6 (createBrowserRouter)
- **Build Tool**: Vite 5
- **State Management**: Redux Toolkit (@reduxjs/toolkit) with typed hooks (`useAppDispatch`, `useAppSelector`)
- **UI Library**: MUI (Material UI) v6 — components, icons, data grid, date pickers
- **Styling**: Tailwind CSS 3 + MUI's `sx` prop + Emotion (styled-components also installed but MUI sx is primary)
- **HTTP Client**: Axios with interceptors (src/services/axiosClient.ts)
- **Offline Storage**: IndexedDB via `idb` library (src/helpers/indexDB/)
- **Charts**: Recharts
- **Date Handling**: Day.js
- **Forms**: react-hook-form

## Code Quality

- **Linter**: ESLint 9 (flat config) with TypeScript, React, and React Hooks plugins
- **Formatter**: Prettier (tabWidth: 4, printWidth: 150, singleAttributePerLine: true, Tailwind plugin)
- **Pre-commit**: Husky + lint-staged (auto-runs eslint --fix and prettier --write on staged files)

## Environment Variables

- Prefixed with `VITE_` for Vite exposure to client code
- `VITE_API_BASE_URL` — backend API base URL
- Configured via `.env` file (see `.env.example`)

## Common Commands

```bash
# Development server
npm run dev

# Production build (runs tsc then vite build)
npm run build

# Lint check
npm run check-eslint

# Format check
npm run check-prettier

# Auto-fix formatting
npm run fix-prettier

# Preview production build
npm run preview
```

## Key Conventions

- Explicit return types on functions (`@typescript-eslint/explicit-function-return-type: warn`)
- No unused variables or parameters (TypeScript strict + ESLint)
- Async thunks use `createAsyncThunk` with typed `rejectValue`
- API base URL comes from `import.meta.env.VITE_API_BASE_URL`
- Auth token stored in localStorage and attached via Axios request interceptor
