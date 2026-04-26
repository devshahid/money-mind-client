# Project Structure

```
src/
├── App.tsx                  # Router definition (createBrowserRouter), top-level route config
├── main.tsx                 # React root render, provider tree (Redux, Theme, Snackbar, Layout)
├── index.css                # Global styles (Tailwind directives + custom CSS)
├── vite-env.d.ts            # Vite type declarations
│
├── assets/                  # Static assets (fonts, illustrations, images)
│
├── components/              # Reusable UI components
│   ├── Table.tsx            # Main transaction table (CustomTable) with group badges and info icons
│   ├── CustomModal.tsx      # Reusable modal wrapper (hidden scrollbar, 90vh max)
│   ├── BulkActionToolbar.tsx # Toolbar for multi-select actions (labels, groups)
│   ├── GroupDialog.tsx      # Create/edit group dialog with split type selection, member management, auto-calculate
│   ├── GroupListView.tsx    # Table of transaction groups with sorting (name/status/net)
│   ├── GroupSummaryView.tsx # Group detail view with per-member settlement breakdown and suggestions
│   ├── LabelAssignmentDialog.tsx # Bulk label assignment with freeSolo autocomplete
│   ├── TransactionControls.tsx # Filter/search/upload/sync controls
│   ├── Debt.tsx             # Debt tracking component
│   ├── Goals.tsx            # Financial goals component
│   ├── ProtectedRoute.tsx   # Auth guard (redirects to /login)
│   ├── GuestRoute.tsx       # Guest guard (redirects authenticated users)
│   ├── GlobalSnackbar.tsx   # App-wide notification snackbar
│   └── SnackBar.tsx         # Snackbar component
│
├── pages/                   # Route-level page components
│   ├── Dashboard.tsx        # Main dashboard with charts
│   ├── TransactionLogs.tsx  # Transaction list, filtering, grouping, bulk actions, tab navigation
│   ├── Login.tsx            # Login page
│   ├── Register.tsx         # Registration page
│   └── Account.tsx          # User account page
│
├── store/                   # Redux Toolkit slices and store config
│   ├── index.ts             # configureStore, RootState, AppDispatch exports
│   ├── authSlice.ts         # Auth state (login, logout, setUserData)
│   ├── transactionSlice.ts  # Transactions CRUD, labels, pagination, sync
│   └── groupSlice.ts        # Transaction groups CRUD, IMember, split types, memoized selectors
│
├── services/                # API layer
│   ├── axiosClient.ts       # Axios instance with auth interceptor
│   └── authService.ts       # Auth-specific API calls
│
├── contexts/                # React Context providers
│   ├── ThemeContext.tsx      # Light/dark mode toggle (MUI ThemeProvider)
│   ├── LayoutContext.tsx     # Layout state (sidebar, header)
│   └── SnackBarContext.tsx   # Global snackbar notifications
│
├── hooks/                   # Custom React hooks
│   ├── slice-hooks.ts       # Typed useAppDispatch / useAppSelector
│   └── useAuth.ts           # Auth convenience hook
│
├── helpers/
│   └── indexDB/             # IndexedDB helpers (offline-first edits)
│       ├── db.ts            # DB schema (v5) and initialization
│       ├── transactionStore.ts # Transaction CRUD in IndexedDB
│       └── groupStore.ts    # Group CRUD in IndexedDB
│
├── types/                   # Shared TypeScript types
│   └── splitTypes.ts        # SplitType enum, SplitConfiguration, labels, descriptions
│
├── utils/                   # Pure utility functions
│   ├── auth.ts              # isAuthenticated check
│   ├── common.ts            # General helpers
│   ├── groupUtils.ts        # computeGroupSummary, mergeLabels, MemberSettlement
│   └── splitCalculations.ts # calculateShares, calculateSettlements, settlement optimization
│
├── constants/
│   └── index.ts             # Expense categories, table column headers, style constants
│
└── layouts/                 # App shell layout
    ├── main.tsx             # Main layout with Outlet
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

## Architecture Patterns

- **Provider tree** (main.tsx): SnackbarProvider → LayoutProvider → ColorContextProvider → Redux Provider
- **Route guards**: ProtectedRoute wraps authenticated routes; GuestRoute wraps login/register
- **State flow**: Redux for server-synced data (transactions, groups, auth); React Context for UI state (theme, layout, snackbar)
- **Offline-first edits**: Local changes saved to IndexedDB, merged with API responses, synced on demand
- **Components vs Pages**: Pages are route-level containers with business logic; components are reusable UI pieces
- **Group member suggestions**: Extracted from existing groups + logged-in user (no separate member API)
- **Expense splitting**: Split calculations are pure functions in `splitCalculations.ts`, UI in `GroupDialog.tsx`, summary in `GroupSummaryView.tsx`

## Key Data Models

- **ITransactionGroup**: id, name, involvedParty, members (IMember[]), notes, transactionIds, splitType?, splitConfig?, timestamps
- **IMember**: name, share, paid, percentage?
- **SplitType**: EQUAL_INCLUDE_PAYER, EQUAL_EXCLUDE_PAYER, CUSTOM_AMOUNTS, PERCENTAGE_SPLIT, LOAN, ITEMIZED
- **IndexedDB v5**: edited_transactions, labels, transaction_groups stores
