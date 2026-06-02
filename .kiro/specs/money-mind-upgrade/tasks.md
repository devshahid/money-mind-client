# Implementation Plan: Money Mind Upgrade

## Overview

Implement the Money Mind upgrade in dependency order: TypeScript types and IndexedDB schema first, then Redux slices and service layer, then feature pages and components, then analytics and AI, and finally wiring everything together. Property-based tests (fast-check) are placed close to the logic they validate.

## Tasks

- [x] 1. Set up TypeScript types and IndexedDB schema

  - [x] 1.1 Create `src/types/` directory with all interface files
    - Create `src/types/transaction.ts` — extend `ITransaction` with `groupId`, `debtId`, `goalId`, `aiSuggestedCategory`, `aiSuggestedLabels`, `aiSuggestionAccepted`
    - Create `src/types/transactionGroup.ts` — `ITransactionGroup`, `ITransactionGroupDetail`
    - Create `src/types/debt.ts` — `IDebt`, `IEMIPayment`, `DebtStatus`
    - Create `src/types/goal.ts` — `IGoal`, `IGoalContribution`
    - Create `src/types/budget.ts` — `IBudget`
    - Create `src/types/ai.ts` — `IAISuggestion`, `IAIGroupSuggestion`, `IAIDebtStrategy`, `IAIChatMessage`
    - _Requirements: 1.4, 2.1, 4.1, 5.1, 6.1, 7.1, 9.1_
  - [x] 1.2 Bump IndexedDB schema from v2 to v3
    - Edit `src/helpers/indexDB/db.ts` — add `pending_groups`, `pending_debts`, `pending_goals`, `pending_budgets` object stores; increment DB version to 3
    - _Requirements: 3.6_

- [x] 2. Implement core utility functions

  - [x] 2.1 Create `src/utils/groupUtils.ts`
    - Implement `calculateGroupBalance(transactions: ITransaction[]): number`
    - _Requirements: 4.3, 4.11_
  - [x] 2.2 Write property test for `calculateGroupBalance`
    - **Property 13: Group balance calculation**
    - **Validates: Requirements 4.3, 4.11**
    - File: `src/utils/__tests__/groupUtils.property.test.ts`
  - [x] 2.3 Create `src/utils/debtUtils.ts`
    - Implement `calculateEMI(principal, annualRate, tenureMonths)`, `calculateTotalInterest(principal, emi, tenureMonths)`, `projectedPayoffDate(remainingBalance, monthlyEMI, annualRate, fromDate)`
    - _Requirements: 5.2, 5.3, 5.6, 5.7_
  - [x] 2.4 Write property tests for debt utility functions
    - **Property 17: EMI and interest calculations**
    - **Property 18: Payment reduces remaining balance**
    - **Property 20: EMI reminder threshold**
    - **Validates: Requirements 5.2, 5.3, 5.5, 5.7**
    - File: `src/utils/__tests__/debtUtils.property.test.ts`
  - [x] 2.5 Create `src/utils/budgetUtils.ts`
    - Implement `calculateSpentForBudget(transactions, category, month, year)` using `dayjs`
    - _Requirements: 7.2_
  - [x] 2.6 Write property tests for budget utility functions
    - **Property 22: Budget spend calculation**
    - **Property 23: Budget threshold indicators**
    - **Validates: Requirements 7.2, 7.4, 7.5**
    - File: `src/utils/__tests__/budgetUtils.property.test.ts`
  - [x] 2.7 Create `src/utils/analyticsUtils.ts`
    - Implement helpers for monthly income/expense aggregation, category breakdown, net savings trend
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 2.8 Write property tests for analytics utility functions
    - **Property 24: Analytics mathematical invariants**
    - **Property 25: Analytics filter correctness**
    - **Validates: Requirements 8.2, 8.3, 8.6, 8.7**
    - File: `src/utils/__tests__/analyticsUtils.property.test.ts`
  - [x] 2.9 Create `src/utils/goalUtils.ts`
    - Implement `applyContribution(goal, amount)` returning updated `currentSavedAmount`, `remainingAmount`, `isAchieved`
    - _Requirements: 6.3, 6.5_
  - [x] 2.10 Write property test for goal contribution invariant
    - **Property 21: Goal contribution invariant**
    - **Validates: Requirements 6.2, 6.3, 6.5**
    - File: `src/utils/__tests__/goalUtils.property.test.ts`

- [x] 3. Checkpoint — Ensure all utility tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement API service layer

  - [x] 4.1 Create `src/services/transactionGroupService.ts`
    - Thin `axiosClient` wrappers for `GET/POST/PUT/DELETE /transaction-groups/*`
    - _Requirements: 4.1, 4.8, 4.9, 4.10_
  - [ ] 4.2 Create `src/services/debtService.ts`
    - Wrappers for `/debt/*` and `/debt/emi-payments/*`
    - _Requirements: 5.1, 5.3, 5.7, 5.9_
  - [ ] 4.3 Create `src/services/goalService.ts`
    - Wrappers for `/goals/*` and `/goals/contributions/*`
    - _Requirements: 6.1, 6.2, 6.8_
  - [ ] 4.4 Create `src/services/budgetService.ts`
    - Wrappers for `/budgets/*` including copy-from-month endpoint
    - _Requirements: 7.1, 7.6, 7.7_
  - [ ] 4.5 Create `src/services/analyticsService.ts`
    - Single `GET /analytics/summary` wrapper accepting filter params
    - _Requirements: 8.1, 8.6, 8.7_
  - [ ] 4.6 Create `src/services/aiService.ts`
    - Wrappers for `/ai/annotate`, `/ai/group-suggest`, `/ai/debt-strategy`, `/ai/goal-suggest`, `/ai/budget-suggest`, `/ai/chat`
    - _Requirements: 9.1, 9.3, 9.5, 9.6, 9.7, 9.8_
  - [x] 4.7 Wrap existing statement upload in `src/services/statementService.ts`
    - Wrap `POST /transaction-logs/upload-data-from-file`, add `POST /transaction-logs/parse-pdf` and `POST /transaction-logs/check-duplicates`
    - _Requirements: 1.3, 1.7, 1.8_

- [ ] 5. Implement Redux slices

  - [x] 5.1 Create `src/store/transactionGroupSlice.ts`
    - State shape: `groups`, `loading`, `error`, `aiGroupSuggestions`
    - Thunks: `listGroups`, `createGroup`, `addToGroup`, `removeFromGroup`, `dissolveGroup`
    - Optimistic create with rollback; enforce double-grouping prevention in reducer
    - _Requirements: 4.1, 4.2, 4.3, 4.8, 4.9, 4.10, 4.12_
  - [ ] 5.2 Write property tests for `transactionGroupSlice`
    - **Property 14: Group membership mutation**
    - **Property 15: Group dissolution**
    - **Property 16: Double-grouping prevention**
    - **Validates: Requirements 4.8, 4.9, 4.10, 4.12**
    - File: `src/store/__tests__/transactionGroupSlice.property.test.ts`
  - [ ] 5.3 Create `src/store/debtSlice.ts`
    - State shape: `debts`, `emiPayments`, `loading`, `error`, `aiStrategy`
    - Thunks: `listDebts`, `createDebt`, `updateDebt`, `deleteDebt`, `recordEMIPayment`, `fetchAIDebtStrategy`
    - Auto-set `status = "PAID_OFF"` when `remainingBalance <= 0`
    - _Requirements: 5.1, 5.2, 5.3, 5.7, 5.8, 5.9, 5.10_
  - [ ] 5.4 Write property test for `debtSlice`
    - **Property 19: Debt auto-paid-off invariant**
    - **Validates: Requirements 5.8**
    - File: `src/store/__tests__/debtSlice.property.test.ts`
  - [ ] 5.5 Create `src/store/goalSlice.ts`
    - State shape: `goals`, `contributions`, `loading`, `error`
    - Thunks: `listGoals`, `createGoal`, `updateGoal`, `deleteGoal`, `recordContribution`
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.8_
  - [ ] 5.6 Create `src/store/budgetSlice.ts`
    - State shape: `budgets`, `loading`, `error`
    - Thunks: `listBudgets`, `createBudget`, `updateBudget`, `deleteBudget`, `copyBudgetsFromMonth`
    - _Requirements: 7.1, 7.6, 7.7_
  - [ ] 5.7 Create `src/store/analyticsSlice.ts`
    - State shape: `monthlyIncomeExpense`, `categoryBreakdown`, `netSavingsTrend`, `loading`, `error`, `filters`
    - Single `fetchAnalytics` thunk parameterized by filters
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [ ] 5.8 Create `src/store/aiSlice.ts`
    - State shape: `annotationSuggestions`, `groupSuggestions`, `debtStrategy`, `chatHistory`, `loading`, `error`
    - Thunks: `fetchAnnotationSuggestions`, `fetchGroupSuggestions`, `fetchDebtStrategy`, `fetchGoalSuggestion`, `fetchBudgetSuggestions`, `sendChatMessage`
    - Reducers: `acceptSuggestion`, `rejectSuggestion`, `dismissGroupSuggestion`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_
  - [ ] 5.9 Write property tests for `aiSlice`
    - **Property 26: AI suggestion coverage and confidence shape**
    - **Property 28: AI suggestion feedback round-trip**
    - **Validates: Requirements 9.1, 9.4, 9.9, 9.10**
    - File: `src/store/__tests__/aiSlice.property.test.ts`
  - [x] 5.10 Register all new slices in `src/store/index.ts`
    - Import and add `transactionGroupReducer`, `debtReducer`, `goalReducer`, `budgetReducer`, `analyticsReducer`, `aiReducer` to `configureStore`
    - _Requirements: 3.1, 3.3_
  - [ ] 5.11 Write property tests for optimistic update and rollback in existing `transactionSlice`
    - **Property 8: Optimistic annotation update**
    - **Property 12: Optimistic update rollback**
    - **Validates: Requirements 2.8, 3.3, 3.4**
    - File: `src/store/__tests__/transactionSlice.property.test.ts`

- [ ] 6. Checkpoint — Ensure all slice and utility tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement statement upload feature

  - [x] 7.1 Create `src/components/statement/StatementPreviewTable.tsx`
    - Render parsed rows in a table; highlight duplicate rows with a flag chip; allow per-row skip/overwrite toggle
    - _Requirements: 1.5, 1.8_
  - [x] 7.2 Create `src/components/statement/StatementUpload.tsx`
    - File picker accepting `.csv,.xls,.xlsx,.pdf`; bank name prompt step; call `statementService` for PDF parse or client-side XLSX parse; call `check-duplicates`; show `StatementPreviewTable`; on confirm dispatch import thunk then `fetchAnnotationSuggestions`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ] 7.3 Write property tests for statement parsing logic
    - **Property 1: Statement parsing extracts all rows**
    - **Property 2: Bank name association invariant**
    - **Property 3: Malformed file produces no imports**
    - **Property 4: Duplicate transactions are flagged**
    - **Validates: Requirements 1.3, 1.4, 1.7, 1.8**
    - File: `src/services/__tests__/statement.property.test.ts`

- [ ] 8. Implement transaction annotation and filtering enhancements

  - [x] 8.1 Update transaction annotation panel in `TransactionLogs` (or its edit drawer)
    - Add `AIAnnotationSuggestion.tsx` — inline chip showing `aiSuggestedCategory` / `aiSuggestedLabels` with accept/reject buttons; on accept dispatch `acceptSuggestion` and update transaction fields
    - _Requirements: 2.1, 2.2, 9.2_
  - [x] 8.2 Create `src/components/transactions/AIAnnotationSuggestion.tsx`
    - Renders suggestion chip with confidence badge; calls `acceptSuggestion` / `rejectSuggestion` from `aiSlice`
    - _Requirements: 9.2, 9.9_
  - [ ] 8.3 Write property tests for annotation round-trip and filter correctness
    - **Property 6: Annotation round-trip**
    - **Property 7: Filter returns only matching transactions**
    - **Property 5: Bank filter isolation**
    - **Validates: Requirements 2.2, 2.4, 2.5, 2.6, 2.7, 1.9, 1.10**
    - File: `src/store/__tests__/annotation.property.test.ts`, `src/utils/__tests__/transactionFilter.property.test.ts`
  - [ ] 8.4 Write property tests for IndexedDB sync queue
    - **Property 9: Sync cleanup round-trip**
    - **Property 10: Sync failure retains queue**
    - **Validates: Requirements 2.9, 2.10**
    - File: `src/helpers/indexDB/__tests__/indexDB.property.test.ts`
  - [ ] 8.5 Write property test for persistence round-trip
    - **Property 11: Persistence round-trip**
    - **Validates: Requirements 3.1, 3.2, 3.5**
    - File: `src/services/__tests__/api.property.test.ts`

- [x] 9. Implement transaction grouping UI

  - [x] 9.1 Create `src/components/transactions/TransactionGroupBadge.tsx`
    - Small badge/chip rendered on grouped rows in the transaction table
    - _Requirements: 4.5_
  - [x] 9.2 Create `src/components/transactions/CreateGroupModal.tsx`
    - Modal with group name input; confirm dispatches `createGroup`; validates ≥ 2 transactions selected; shows informative message if a selected transaction already has a `groupId`
    - _Requirements: 4.1, 4.2, 4.12_
  - [x] 9.3 Create `src/components/transactions/GroupDetailDrawer.tsx`
    - Slide-in drawer listing member transactions, group name, `groupBalance`, settled indicator; add/remove transaction actions
    - _Requirements: 4.3, 4.6, 4.7, 4.8, 4.9, 4.11_
  - [x] 9.4 Create `src/components/transactions/AIGroupSuggestion.tsx`
    - Banner showing AI-suggested group candidates with confidence indicator; accept dispatches `createGroup`; dismiss calls `dismissGroupSuggestion`
    - _Requirements: 9.3, 9.4_
  - [x] 9.5 Wire grouping UI into `TransactionLogs` page
    - Add multi-select checkboxes; show "Create Group" action bar when ≥ 2 selected; render `TransactionGroupBadge` on grouped rows; render `AIGroupSuggestion` banner; open `GroupDetailDrawer` on group click
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7_

- [ ] 10. Implement Debts page and components

  - [ ] 10.1 Create `src/components/debt/DebtCard.tsx`
    - Summary card: debt name, lender, total amount, remaining, interest rate, monthly EMI, next payment date, status chip
    - _Requirements: 5.4_
  - [ ] 10.2 Create `src/components/debt/EMIPaymentModal.tsx`
    - Form for recording EMI or part-payment; amount, date, optional transaction link; dispatches `recordEMIPayment`
    - _Requirements: 5.3, 5.7, 5.9_
  - [ ] 10.3 Create `src/components/debt/DebtPayoffPlanner.tsx`
    - Line chart (recharts) showing projected remaining balance over time using `projectedPayoffDate`; warn if EMI too low to cover interest
    - _Requirements: 5.6_
  - [ ] 10.4 Create `src/components/debt/AIDebtStrategy.tsx`
    - Panel showing avalanche/snowball recommendation from `aiSlice.debtStrategy`; ordered debt list with rationale
    - _Requirements: 9.5_
  - [ ] 10.5 Create `src/pages/Debts.tsx`
    - Full page: dispatch `listDebts` on mount; render `DebtCard` list; FAB to create new debt (react-hook-form modal); confirmation dialog on delete with linked transactions; render `AIDebtStrategy`
    - _Requirements: 5.1, 5.4, 5.5, 5.8, 5.10, 9.5_

- [ ] 11. Implement Goals page and components

  - [ ] 11.1 Create `src/components/goals/GoalCard.tsx`
    - Progress card: name, target, current saved, remaining, percentage bar, deadline, achieved badge
    - _Requirements: 6.4, 6.5_
  - [ ] 11.2 Create `src/components/goals/ContributionModal.tsx`
    - Form for recording a contribution; amount, date, optional transaction link; dispatches `recordContribution`
    - _Requirements: 6.2, 6.8_
  - [ ] 11.3 Create `src/components/goals/AIGoalSuggestion.tsx`
    - Inline suggestion showing AI-recommended monthly contribution amount; accept/dismiss buttons
    - _Requirements: 9.6_
  - [ ] 11.4 Create `src/pages/Goals.tsx`
    - Full page: dispatch `listGoals` on mount; render `GoalCard` list; FAB to create goal; deadline warning when on-track check fails; render `AIGoalSuggestion` per goal
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 9.6_
  - [ ] 11.5 Write property test for AI goal contribution suggestion
    - **Property 27: AI goal contribution suggestion**
    - **Validates: Requirements 9.6**
    - File: `src/utils/__tests__/aiUtils.property.test.ts`

- [ ] 12. Implement Budget page and components

  - [ ] 12.1 Create `src/components/budget/BudgetCard.tsx`
    - Per-category card: category name, limit, spent (from `calculateSpentForBudget`), remaining, progress bar; warning/over-budget indicator based on 80% threshold
    - _Requirements: 7.3, 7.4, 7.5_
  - [ ] 12.2 Create `src/components/budget/BudgetFormModal.tsx`
    - Create/edit form: category selector (predefined list + custom), limit amount, month/year picker; dispatches `createBudget` or `updateBudget`
    - _Requirements: 7.1, 7.7_
  - [ ] 12.3 Create `src/components/budget/AIBudgetSuggestion.tsx`
    - Panel listing categories consistently over budget with AI-suggested revised limits; accept/dismiss per suggestion
    - _Requirements: 9.7_
  - [ ] 12.4 Create `src/pages/Budget.tsx`
    - Full page: dispatch `listBudgets` on mount; render `BudgetCard` list; copy-from-previous-month action; render `AIBudgetSuggestion`
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 9.7_

- [ ] 13. Implement Analytics page and components

  - [ ] 13.1 Create `src/components/analytics/IncomeExpenseChart.tsx`
    - recharts `BarChart` — last 12 months income vs expense from `analyticsSlice.monthlyIncomeExpense`
    - _Requirements: 8.1_
  - [ ] 13.2 Create `src/components/analytics/CategoryPieChart.tsx`
    - recharts `PieChart` — category breakdown from `analyticsSlice.categoryBreakdown`
    - _Requirements: 8.2_
  - [ ] 13.3 Create `src/components/analytics/NetSavingsChart.tsx`
    - recharts `LineChart` — net savings trend from `analyticsSlice.netSavingsTrend`
    - _Requirements: 8.3_
  - [ ] 13.4 Create `src/components/analytics/DebtProgressChart.tsx`
    - recharts `LineChart` — remaining balance over time per active debt
    - _Requirements: 8.4_
  - [ ] 13.5 Create `src/components/analytics/GoalsSummaryChart.tsx`
    - recharts `BarChart` — current saved vs target per active goal
    - _Requirements: 8.5_
  - [ ] 13.6 Create `src/pages/Analytics.tsx`
    - Full page: date range + bank filter controls; dispatch `fetchAnalytics` on mount and on filter change; render all five chart components
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 14. Implement AI Chat page and components

  - [x] 14.1 Create `src/components/ai/AIFeedbackButtons.tsx`
    - Reusable accept/reject button pair; calls provided callbacks; used by all AI suggestion components
    - _Requirements: 9.2, 9.4, 9.10_
  - [x] 14.2 Create `src/components/ai/AIChatPanel.tsx`
    - Chat message list + input box; dispatches `sendChatMessage`; renders `chatHistory` from `aiSlice`; shows loading indicator while awaiting response
    - _Requirements: 9.8_
  - [x] 14.3 Create `src/pages/AIChat.tsx`
    - Full page wrapping `AIChatPanel`; dispatch `sendChatMessage` on submit
    - _Requirements: 9.8_

- [x] 15. Update Dashboard with new summary components

  - [x] 15.1 Create `src/components/dashboard/SummaryCard.tsx`
    - Reusable stat card component replacing hardcoded dashboard cards; props: title, value, icon, color
    - _Requirements: 8.8_
  - [x] 15.2 Create `src/components/dashboard/EMIReminderBanner.tsx`
    - Reads debts from `debtSlice`; filters where `nextPaymentDate` is within 5 days; renders reminder banner per debt
    - _Requirements: 5.5_
  - [x] 15.3 Create `src/components/dashboard/BudgetWarningBanner.tsx`
    - Reads budgets from `budgetSlice` and transactions; renders warning for categories at 80%+ of limit
    - _Requirements: 7.4_
  - [x] 15.4 Update `Dashboard.tsx`
    - Replace hardcoded stat cards with `SummaryCard` components (total balance, monthly income, monthly expenses, active goal savings); add `EMIReminderBanner` and `BudgetWarningBanner`; add active goals progress indicators
    - _Requirements: 5.5, 6.6, 7.4, 8.8_

- [x] 16. Update routing and navigation

  - [x] 16.1 Update `App.tsx` with new routes
    - Add routes for `debts`, `goals`, `budget`, `analytics`, `ai-chat` pointing to new page components
    - _Requirements: 3.1_
  - [x] 16.2 Update `Sidebar.tsx`
    - Add `/ai-chat` nav item with `SmartToy` icon; ensure `/debts`, `/goals`, `/budget`, `/analytics` nav items are present
    - _Requirements: 9.8_

- [ ] 17. Checkpoint — Ensure all tests pass and pages render correctly

  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Final integration and wiring

  - [x] 18.1 Verify `StatementUpload` is accessible from `TransactionLogs` page
    - Ensure the upload button opens `StatementUpload`; bank filter in transaction list reflects imported bank names
    - _Requirements: 1.1, 1.9, 1.10_
  - [x] 18.2 Verify transaction-to-debt and transaction-to-goal linking flows
    - Confirm that linking a transaction to a debt via `EMIPaymentModal` sets `debtId` on the transaction and adds to `linkedTransactionIds` on the debt; same for goal contributions
    - _Requirements: 5.9, 6.8_
  - [x] 18.3 Verify AI annotation suggestions fire after statement import
    - Confirm `fetchAnnotationSuggestions` is dispatched with new transaction IDs after confirmed import; suggestions appear in annotation panel
    - _Requirements: 9.1, 9.2_
  - [x] 18.4 Verify optimistic update and rollback wiring across all new slices
    - Confirm each new slice's create/update/delete thunks apply optimistic updates and revert on failure using the established pattern
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 19. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests require `fast-check` (`npm install --save-dev fast-check`) and each must run with `{ numRuns: 100 }`
- Each property test file must include the comment tag: `// Feature: money-mind-upgrade, Property {N}: {property_text}`
- All 28 correctness properties from the design document are covered by the `*`-marked property test sub-tasks
- Checkpoints at tasks 3, 6, 17, and 19 ensure incremental validation
- All new slices follow the existing `transactionSlice` pattern: optimistic update → thunk → reconcile or revert
