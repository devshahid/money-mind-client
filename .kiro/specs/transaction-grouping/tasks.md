# Implementation Plan: Transaction Grouping

## Overview

Implement bulk actions, transaction grouping, and expense splitting for the Transaction Logs page. The plan follows a bottom-up dependency order: persistence layer → state management → utility functions → UI components → integration into existing pages. Each task builds on the previous, ensuring no orphaned code.

## Tasks

- [x]   1. Extend IndexedDB schema and create GroupStore persistence

    - [x] 1.1 Update `src/helpers/indexDB/db.ts` to add `transaction_groups` object store

        - Database version is now at `5`
        - Add `transaction_groups` to the `ExpenseDB` interface
        - Add conditional `createObjectStore("transaction_groups", { keyPath: "id" })` in the upgrade handler
        - _Requirements: 15.1, 15.2, 15.3_

    - [x] 1.2 Create `src/helpers/indexDB/groupStore.ts` with GroupStore class

        - Implement `saveGroup`, `getAllGroups`, `getGroup`, `deleteGroup`
        - Export a singleton `groupStore` instance
        - _Requirements: 5.1, 5.4_

- [x]   2. Create utility functions

    - [x] 2.1 Implement `computeGroupSummary` in `src/utils/groupUtils.ts`

        - Returns `{ totalDebits, totalCredits, netSettlement, status, memberSettlements }`
        - Per-member settlement: `net = paid - share`
        - Status = "Settled" when all members have net === 0
        - _Requirements: 6.1, 6.2, 6.4, 6.5, 17.6, 17.7_

    - [x] 2.2 Implement `mergeLabels` in `src/utils/groupUtils.ts`

        - _Requirements: 2.3_

    - [x] 2.3 Create `src/utils/splitCalculations.ts`

        - `calculateShares(members, splitType, totalAmount)` — auto-calculate per split type
        - `calculateSettlements(members)` — greedy settlement optimization
        - `calculateTotalDebits/Credits` — sum transaction amounts
        - `getSplitTypeExplanation` — user-friendly split descriptions
        - _Requirements: 18.1-18.7, 19.1-19.6_

    - [x] 2.4 Create `src/types/splitTypes.ts`

        - `SplitType` enum: EQUAL_INCLUDE_PAYER, EQUAL_EXCLUDE_PAYER, CUSTOM_AMOUNTS, PERCENTAGE_SPLIT, LOAN, ITEMIZED
        - `SplitConfiguration` interface
        - `SPLIT_TYPE_LABELS` and `SPLIT_TYPE_DESCRIPTIONS` records
        - _Requirements: 18.1, 18.8_

- [x]   3. Implement `groupSlice` Redux state management

    - [x] 3.1 Create `src/store/groupSlice.ts`

        - `IMember`: name, share, paid, percentage?
        - `ITransactionGroup`: id, name, involvedParty, members, notes, transactionIds, splitType?, splitConfig?, timestamps
        - Async thunks: `loadGroups`, `createGroup`, `updateGroup`, `deleteGroup`, `addTransactionsToGroup`, `removeTransactionFromGroup`
        - `selectTransactionGroupMap` memoized selector
        - _Requirements: 14.1, 14.2, 5.1, 5.3, 5.4, 4.3, 4.4, 8.2, 17.2_

    - [x] 3.2 Register `groupReducer` in `src/store/index.ts`
        - _Requirements: 14.1_

- [x]   4. Implement dialog and toolbar UI components

    - [x] 4.1 Create `src/components/LabelAssignmentDialog.tsx`

        - _Requirements: 2.2, 2.6, 2.7_

    - [x] 4.2 Create `src/components/GroupDialog.tsx`

        - Split type selection dropdown with descriptions
        - Dynamic member rows with Autocomplete name fields (suggestions from existing groups + logged-in user)
        - Paid, share, percentage fields per member (conditional on split type)
        - "Calculate Shares" button for auto-fill
        - Real-time net calculation chips per member
        - Total paid vs total shares summary
        - Validation: group name required, at least one member, paid vs total mismatch warning
        - In create mode: auto-populates logged-in user with total debits as paid
        - In edit mode: pre-populates all fields including splitType
        - _Requirements: 3.2, 3.4, 13.1, 13.2, 13.4, 17.1, 17.8, 18.1-18.7, 19.1-19.4, 20.1-20.4_

    - [x] 4.3 Create `src/components/BulkActionToolbar.tsx`
        - _Requirements: 1.1-1.4, 2.1, 3.1, 3.5, 4.1, 4.2_

- [x]   5. Implement group display components

    - [x] 5.1 Create `src/components/GroupSummaryView.tsx`

        - Split type badge display
        - Settlement suggestions (who pays whom) via `calculateSettlements`
        - Per-member settlement breakdown with color-coded chips
        - Transaction list with remove actions
        - Edit button closes summary and opens GroupDialog
        - _Requirements: 6.1-6.7, 7.1-7.3, 8.1-8.3, 13.1, 17.3-17.6, 19.5-19.6, 21.1_

    - [x] 5.2 Create `src/components/GroupListView.tsx`

        - Table with name, member count, transaction count, net settlement, status
        - Sorting by name, status, or net amount
        - _Requirements: 11.1-11.4, 9.1-9.3_

- [x]   6. Extend CustomTable with group columns

    - [x] 6.1 Modify `src/components/Table.tsx`
        - Group badge chips with overflow handling
        - Group info icon with popover
        - _Requirements: 10.1-10.7_

- [x]   7. Integrate everything into TransactionLogs page

    - [x] 7.1 Tab bar, selection reset, group loading

        - MUI Tabs: "All Transactions" (default) and "Grouped Transactions"
        - Selection reset on page/filters/limit changes
        - `loadGroups()` on mount
        - _Requirements: 12.1-12.4, 16.1, 16.2, 14.3_

    - [x] 7.2 Wire all dialogs and handlers

        - BulkActionToolbar → LabelAssignmentDialog, GroupDialog, AddToGroup
        - GroupSummaryView → edit (closes summary, opens GroupDialog), delete, remove transaction
        - GroupDialog rendered unconditionally (not gated by selectedIds)
        - Edit mode receives group's transactions; create mode receives selected transactions
        - _Requirements: 1.1-1.4, 2.2-2.7, 3.1, 3.3, 4.1-4.3, 9.3-9.4, 12.7, 13.3, 21.1-21.3_

    - [x] 7.3 CustomModal scrollbar fix

        - Hidden scrollbar (scrollbarWidth: none, webkit-scrollbar: display none)
        - Content still scrollable via mouse wheel/trackpad/touch

- [ ]   8. Optional: Tests

    - [ ]\* 8.1 Property tests for `computeGroupSummary`, `mergeLabels`, `calculateShares`, `calculateSettlements`
    - [ ]\* 8.2 Property tests for GroupStore CRUD round-trips
    - [ ]\* 8.3 Property tests for groupSlice actions and selectors
    - [ ]\* 8.4 Unit tests for BulkActionToolbar, GroupDialog, GroupSummaryView, GroupListView

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Member name suggestions are derived from existing groups + logged-in user (no separate member API)
- The implementation order ensures no orphaned code: persistence → state → utils → components → integration
- IndexedDB version is at 5 (bumped from original 3 → 4 for groups, then 4 → 5 for members field)
