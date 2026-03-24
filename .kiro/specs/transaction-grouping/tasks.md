# Implementation Plan: Transaction Grouping

## Overview

Implement bulk actions and transaction grouping for the Transaction Logs page. The plan follows a bottom-up dependency order: persistence layer → state management → utility functions → UI components → integration into existing pages. Each task builds on the previous, ensuring no orphaned code.

## Tasks

- [x]   1. Extend IndexedDB schema and create GroupStore persistence

    - [x] 1.1 Update `src/helpers/indexDB/db.ts` to add `transaction_groups` object store

        - Bump database version from `3` to `4`
        - Add `transaction_groups` to the `ExpenseDB` interface with `key: string` and `value: ITransactionGroup`
        - Add conditional `createObjectStore("transaction_groups", { keyPath: "id" })` in the upgrade handler
        - Ensure existing `edited_transactions` and `labels` stores are not affected
        - _Requirements: 15.1, 15.2, 15.3_

    - [x] 1.2 Create `src/helpers/indexDB/groupStore.ts` with GroupStore class

        - Implement `saveGroup(group: ITransactionGroup): Promise<void>` using `db.put("transaction_groups", group)`
        - Implement `getAllGroups(): Promise<ITransactionGroup[]>` using `db.getAll("transaction_groups")`
        - Implement `getGroup(id: string): Promise<ITransactionGroup | undefined>` using `db.get("transaction_groups", id)`
        - Implement `deleteGroup(id: string): Promise<void>` using `db.delete("transaction_groups", id)`
        - Export a singleton `groupStore` instance following the `indexDBTransaction` pattern
        - _Requirements: 5.1, 5.4_

    - [ ]\* 1.3 Write property tests for GroupStore CRUD round-trips
        - **Property 6: Group persistence round-trip** — save then retrieve returns equivalent object
        - **Property 8: Group deletion removes record** — delete then retrieve returns undefined
        - **Validates: Requirements 5.1, 5.4, 9.3**

- [x]   2. Create utility functions in `src/utils/groupUtils.ts`

    - [x] 2.1 Implement `computeGroupSummary` function

        - Filter transactions by group's `transactionIds`
        - Sum amounts for credit vs debit (parse `amount` as number, check `isCredit`)
        - Return `{ totalDebits, totalCredits, netSettlement, status }` where status is "Settled" when net === 0
        - _Requirements: 6.1, 6.2, 6.4, 6.5_

    - [x] 2.2 Implement `mergeLabels` function

        - Return `Array.from(new Set([...existing, ...incoming]))` to merge without duplicates
        - _Requirements: 2.3_

    - [ ]\* 2.3 Write property tests for `computeGroupSummary` and `mergeLabels`
        - **Property 2: Label merge preserves existing and adds new without duplicates**
        - **Property 9: Group summary computation** — totalDebits, totalCredits, netSettlement correctness
        - **Property 10: Group status derivation** — "Settled" iff netSettlement === 0
        - **Property 11: Net settlement label by sign** — positive = "Owed to you", negative = "You owe"
        - **Validates: Requirements 2.3, 6.1, 6.2, 6.4, 6.5, 6.6**

- [x]   3. Implement `groupSlice` Redux state management

    - [x] 3.1 Create `src/store/groupSlice.ts` with ITransactionGroup interface and IGroupState

        - Define `ITransactionGroup` with `id`, `name`, `involvedParty`, `notes`, `transactionIds`, `createdAt`, `updatedAt`
        - Define `IGroupState` with `groups: ITransactionGroup[]`, `loading: boolean`, `error: string | null`
        - Implement async thunks: `loadGroups`, `createGroup`, `updateGroup`, `deleteGroup`, `addTransactionsToGroup`, `removeTransactionFromGroup`
        - Each thunk persists to GroupStore then updates Redux state
        - `createGroup` generates ID via `crypto.randomUUID()` and sets `createdAt`/`updatedAt`
        - `updateGroup` sets new `updatedAt` timestamp
        - `addTransactionsToGroup` deduplicates transaction IDs before saving
        - `removeTransactionFromGroup` removes a single transaction ID from the group
        - Implement `selectTransactionGroupMap` memoized selector using `createSelector`
        - _Requirements: 14.1, 14.2, 5.1, 5.3, 5.4, 4.3, 4.4, 8.2_

    - [x] 3.2 Register `groupReducer` in `src/store/index.ts`

        - Import `groupReducer` from `./groupSlice`
        - Add `groups: groupReducer` to the store's reducer map
        - _Requirements: 14.1_

    - [ ]\* 3.3 Write property tests for groupSlice actions and selectors
        - **Property 5: Adding transactions to a group deduplicates**
        - **Property 7: Group update sets updatedAt timestamp**
        - **Property 12: Remove transaction from group** — ID removed, others unchanged
        - **Property 13: Transaction-to-group lookup map** — selectTransactionGroupMap correctness
        - **Property 19: Redux-IndexedDB sync after CRUD**
        - **Validates: Requirements 4.3, 4.4, 5.3, 8.2, 10.1, 10.4, 10.7, 14.2**

- [x]   4. Checkpoint - Ensure persistence and state layers work

    - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Implement dialog and toolbar UI components

    - [x] 5.1 Create `src/components/LabelAssignmentDialog.tsx`

        - Wrap `CustomModal` with a multi-select `Autocomplete` (`freeSolo`) for label selection
        - Accept `open`, `onClose`, `onConfirm`, `availableLabels` props
        - On confirm, pass selected labels array; on close without confirm, no-op
        - If confirmed with empty selection, close without modifying transactions
        - _Requirements: 2.2, 2.6, 2.7_

    - [x] 5.2 Create `src/components/GroupDialog.tsx`

        - Wrap `CustomModal` with fields: group name (required), involved party (text), notes (text)
        - Accept `open`, `onClose`, `onSubmit`, `initialData`, `mode` ("create" | "edit") props
        - Validate non-empty group name before submit; show inline error if empty
        - In edit mode, pre-populate fields from `initialData`
        - _Requirements: 3.2, 3.4, 13.1, 13.2, 13.4_

    - [x] 5.3 Create `src/components/BulkActionToolbar.tsx`

        - Render between TransactionControls and CustomTable when `selectedIds.length > 0`
        - Display selected count (e.g., "3 selected")
        - "Clear Selection" button calls `onClearSelection`
        - "Attach to Logs" button calls `onAttachToLogs`
        - "Create Group" button disabled when `selectedIds.length < 2`, calls `onCreateGroup`
        - "Add to Group" dropdown visible only when `groupsExist` is true, calls `onAddToGroup(groupId)`
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.5, 4.1, 4.2_

    - [ ]\* 5.4 Write property tests for BulkActionToolbar
        - **Property 1: Bulk toolbar displays correct selection count**
        - **Property 3: Create Group button enabled only when two or more selected**
        - **Property 17: Bulk toolbar hidden on Grouped Transactions tab**
        - **Validates: Requirements 1.1, 1.3, 3.1, 3.5, 12.7**

- [x]   6. Implement group display components

    - [x] 6.1 Create `src/components/GroupSummaryView.tsx`

        - Render as `CustomModal` showing group metadata, computed summary via `computeGroupSummary`
        - Display total debits, total credits, net settlement, status, involved party
        - Display net settlement label: positive = "Owed to you", negative = "You owe"
        - List member transactions with date, narration, type, amount
        - Show "Transaction not found" for missing transaction IDs
        - Provide remove action per transaction, edit group action, delete group action, close action
        - Warn when removal would leave < 2 transactions; offer to delete group instead
        - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 13.1_

    - [x] 6.2 Create `src/components/GroupListView.tsx`

        - Render list/table of all groups with name, involved party, transaction count, net settlement, status
        - Support sorting by name, status, or net amount
        - Each row clickable to open GroupSummaryView
        - Delete action per row with confirmation dialog
        - _Requirements: 11.1, 11.2, 11.3, 11.4, 9.1, 9.2, 9.3_

    - [ ]\* 6.3 Write property tests for GroupListView sorting and GroupSummaryView badge overflow
        - **Property 14: Group badge overflow rendering** — show min(N, 2) chips, "+{N-2}" if N > 2
        - **Property 15: Group list sorting** — correct ascending order for name, status, net amount
        - **Property 16: Group list item displays required fields**
        - **Validates: Requirements 10.2, 11.2, 11.3, 12.5**

- [ ]   7. Checkpoint - Ensure all component tests pass

    - Ensure all tests pass, ask the user if questions arise.

- [x]   8. Extend CustomTable with group columns

    - [x] 8.1 Modify `src/components/Table.tsx` to add Group Badge and Group Info Icon columns
        - Add `groups`, `onGroupBadgeClick`, `onGroupInfoClick` optional props
        - Add "Group" column header to `columnHeaderOptions` or render conditionally
        - For each transaction row, use `selectTransactionGroupMap` to find associated groups
        - Render Group_Badge chips (MUI `Chip`) — show first 2, then "+N" overflow
        - Render Group_Info_Icon (`InfoOutlined`) only for grouped transactions
        - On badge click, call `onGroupBadgeClick(groupId)`
        - On info icon click, show popover with group name, involved party, net settlement, status per group
        - On group name click in popover, call `onGroupBadgeClick(groupId)` to open GroupSummaryView
        - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x]   9. Integrate everything into TransactionLogs page

    - [x] 9.1 Add tab bar and selection reset to `src/pages/TransactionLogs.tsx`

        - Add MUI `Tabs` with "All Transactions" (default) and "Grouped Transactions"
        - Add `activeTab` state; show existing table content on tab 0, GroupListView on tab 1
        - Add `useEffect` to reset `selectedIds` to `[]` when `page`, `filters`, or `limit` change
        - Dispatch `loadGroups()` on component mount to hydrate Redux state from IndexedDB
        - _Requirements: 12.1, 12.2, 12.3, 12.4, 16.1, 16.2, 14.3_

    - [x] 9.2 Wire BulkActionToolbar and dialogs into TransactionLogs

        - Render `BulkActionToolbar` between TransactionControls and CustomTable when `selectedIds.length > 0` AND activeTab === 0
        - Wire "Attach to Logs" → open LabelAssignmentDialog → on confirm, bulk merge labels using `mergeLabels`, persist via Persistence_Flow, clear selection
        - Wire "Create Group" → open GroupDialog in create mode → on submit, dispatch `createGroup` with selected IDs, clear selection
        - Wire "Add to Group" → dispatch `addTransactionsToGroup`, clear selection
        - Wire GroupSummaryView open/close, edit group (GroupDialog edit mode), delete group, remove transaction from group
        - Pass `groups` and group click handlers to CustomTable
        - _Requirements: 1.1, 1.2, 1.4, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.3, 4.1, 4.2, 4.3, 9.3, 9.4, 12.7, 13.3_

    - [ ]\* 9.3 Write property test for selection reset on navigation changes

        - **Property 21: Selection reset on navigation changes** — selectedIds resets to [] on page/filters/limit change
        - **Validates: Requirements 16.1**

    - [ ]\* 9.4 Write property test for database migration
        - **Property 20: Database migration preserves existing stores** — upgrade from v3 to v4 creates transaction_groups without data loss
        - **Validates: Requirements 15.3**

- [ ]   10. Final checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation order ensures no orphaned code: persistence → state → utils → components → integration
