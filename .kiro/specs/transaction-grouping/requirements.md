# Requirements Document

## Introduction

This feature adds bulk action support and transaction grouping to the Transaction Logs page. When a user selects one or more rows in the transaction table, a bulk action toolbar appears with contextual actions: "Attach to Logs" for bulk label assignment, "Create Group" for organizing transactions into named groups, and "Add to Group" for appending transactions to existing groups. Transaction grouping supports three primary use cases: settlement tracking (tracking money spent and returned), debt tracking (tracking borrowed money until repaid), and lending tracking (tracking lent money until returned). Each group calculates net settlement amounts, shows debit/credit totals, tracks settlement status, and identifies the involved party. Grouped transactions are surfaced in the table via both a Group Badge chip and a Group Info Icon for quick access to group details. The Transactions page provides a tab system to switch between "All Transactions" and "Grouped Transactions" views, giving users a dedicated space to track and manage all their groups. Groups are persisted locally in IndexedDB with future backend sync support.

## Glossary

- **Transaction_Logs_Page**: The page component at `src/pages/TransactionLogs.tsx` that displays the paginated transaction table, edit modal, and controls.
- **Transaction_Table**: The existing transaction list rendered by `CustomTable` on the Transactions page, displaying rows of `ITransactionLogs` with checkbox selection.
- **Bulk_Action_Toolbar**: A contextual toolbar that appears between the TransactionControls and the CustomTable when one or more transaction rows are selected, displaying the count of selected items and available bulk actions: "Attach to Logs", "Create Group", and "Add to Group".
- **Selected_Transactions**: The set of transactions whose checkboxes are checked, identified by their `_id` values stored in the `selectedIds` state array.
- **Label_Assignment_Dialog**: A modal (using the existing `CustomModal` component) containing a multi-select `Autocomplete` with `freeSolo` support for assigning labels, consistent with the existing single-transaction edit modal pattern.
- **CustomTable**: The table component at `src/components/Table.tsx` that renders transaction rows with per-row checkboxes and a header checkbox with indeterminate state support.
- **TransactionControls**: The controls component at `src/components/TransactionControls.tsx` that renders search, filter, upload, add cash memo, and sync buttons above the table.
- **Label**: A string tag associated with a transaction via the `label: string[]` field on `ITransactionLogs`. Available labels are sourced from the Redux `labels` state (array of `{ _id, labelName, labelColor }`).
- **IndexDB_Store**: The local persistence layer at `src/helpers/indexDB/transactionStore.ts` providing `saveTransaction` (which internally also calls `saveLabels`) and `getAllLabels` methods.
- **Persistence_Flow**: The established pattern for local edits: call `indexDBTransaction.saveTransaction(tx)`, then `dispatch(setIsLocalTransactions(true))`, then `dispatch(setTransaction(tx))`, then `indexDBTransaction.getAllLabels()`, then `dispatch(setLabels(labels))`.
- **Group**: A named collection of two or more transactions linked together for settlement, debt, or lending tracking purposes.
- **Group_Store**: An IndexedDB object store (`transaction_groups`) that persists Group data locally.
- **Group_Manager**: The system component responsible for creating, updating, deleting, and querying Groups.
- **Group_Summary_View**: A UI panel or section that displays a Group's aggregated financial data (totals, net amount, status, involved party).
- **Net_Settlement_Amount**: The calculated difference between total credits and total debits within a Group; positive means money is owed to the user, negative means the user owes money.
- **Group_Status**: A derived state of a Group — "Settled" when Net_Settlement_Amount equals zero, "Unsettled" when Net_Settlement_Amount is non-zero.
- **Involved_Party**: The person or entity name associated with a Group (e.g., the person who owes or is owed money).
- **Group_Badge**: A visual MUI Chip displayed on a transaction row in the Transaction_Table indicating which Group the transaction belongs to.
- **Group_Dialog**: A modal dialog (using `CustomModal`) for creating or editing a Group's metadata (name, involved party, notes).
- **Group_List_View**: A dedicated view or section listing all existing Groups with summary information.
- **Group_Info_Icon**: An info icon (e.g., MUI `InfoOutlined`) displayed on each grouped transaction row in the Transaction_Table, providing quick access to group details on click.
- **Grouped_Transactions_Tab**: A tab or section on the Transaction_Logs_Page that displays all transaction groups, allowing users to switch between viewing all transactions and viewing grouped transactions.

## Requirements

### Requirement 1: Bulk Action Toolbar Visibility

**User Story:** As a user, I want to see a bulk action toolbar when I select transactions, so that I know bulk operations are available and how many rows I have selected.

#### Acceptance Criteria

1. WHEN one or more transaction rows are selected, THE Bulk_Action_Toolbar SHALL appear between the TransactionControls and the CustomTable.
2. WHEN no transaction rows are selected, THE Bulk_Action_Toolbar SHALL not be rendered.
3. WHILE the Bulk_Action_Toolbar is visible, THE Bulk_Action_Toolbar SHALL display the count of currently Selected_Transactions (e.g., "3 selected").
4. WHEN the user clicks a "Clear Selection" control in the Bulk_Action_Toolbar, THE Transaction_Logs_Page SHALL set `selectedIds` to an empty array.

### Requirement 2: Bulk Label Assignment

**User Story:** As a user, I want to assign labels to multiple transactions at once, so that I can categorize transactions in bulk without editing each one individually.

#### Acceptance Criteria

1. WHILE the Bulk_Action_Toolbar is visible, THE Bulk_Action_Toolbar SHALL display an "Attach to Logs" button.
2. WHEN the user clicks the "Attach to Logs" button, THE Transaction_Logs_Page SHALL open a Label_Assignment_Dialog containing a multi-select Autocomplete with `freeSolo` support, populated with label options from `labels.map(l => l.labelName)` in the Redux state.
3. WHEN the user selects labels and confirms in the Label_Assignment_Dialog, THE Transaction_Logs_Page SHALL apply the chosen labels to every transaction in `selectedIds` by merging the new labels with each transaction's existing `label` array without removing previously assigned labels and without creating duplicate entries.
4. WHEN the label assignment is confirmed, THE Transaction_Logs_Page SHALL persist each updated transaction following the established Persistence_Flow: call `indexDBTransaction.saveTransaction` for each transaction, dispatch `setIsLocalTransactions(true)`, dispatch `setTransaction` for each transaction, call `indexDBTransaction.getAllLabels`, and dispatch `setLabels` with the result.
5. WHEN all updates from the bulk label assignment are persisted, THE Transaction_Logs_Page SHALL clear `selectedIds` to an empty array.
6. IF the user closes the Label_Assignment_Dialog without confirming (via the close button), THEN THE Transaction_Logs_Page SHALL leave all Selected_Transactions and their labels unchanged.
7. IF the user confirms the Label_Assignment_Dialog without selecting any labels, THEN THE Transaction_Logs_Page SHALL not modify any transactions and SHALL close the dialog.

### Requirement 3: Create a Group from Selected Transactions

**User Story:** As a user, I want to select multiple transactions and create a named group from them, so that I can track related financial flows together.

#### Acceptance Criteria

1. WHEN two or more transactions are selected in the Transaction_Table, THE Bulk_Action_Toolbar SHALL display a "Create Group" button.
2. WHEN the user clicks the "Create Group" button, THE Group_Dialog SHALL open with fields for group name, Involved_Party, and optional notes.
3. WHEN the user submits the Group_Dialog with a valid group name, THE Group_Manager SHALL create a new Group containing all selected transaction IDs, the group name, the Involved_Party, the notes, and a generated unique group ID.
4. IF the user submits the Group_Dialog without a group name, THEN THE Group_Dialog SHALL display a validation error indicating that the group name is required.
5. WHEN fewer than two transactions are selected, THE Bulk_Action_Toolbar SHALL disable the "Create Group" button.

### Requirement 4: Add Transactions to an Existing Group

**User Story:** As a user, I want to add new transactions to an existing group, so that I can track additional related payments as they occur.

#### Acceptance Criteria

1. WHEN one or more transactions are selected in the Transaction_Table and at least one existing Group exists, THE Bulk_Action_Toolbar SHALL display an "Add to Group" option.
2. WHEN the user clicks "Add to Group", THE Group_Manager SHALL present a list of existing Groups for the user to choose from.
3. WHEN the user selects a target Group, THE Group_Manager SHALL append the selected transaction IDs to that Group's transaction list and update the Group in the Group_Store.
4. IF a selected transaction already belongs to the target Group, THEN THE Group_Manager SHALL skip that transaction and not create a duplicate entry.

### Requirement 5: Persist Groups in IndexedDB

**User Story:** As a user, I want my transaction groups to be saved locally, so that they persist across browser sessions without requiring a backend.

#### Acceptance Criteria

1. WHEN a Group is created, THE Group_Store SHALL save the Group record with the following fields: group ID, group name, Involved_Party, notes, list of transaction IDs, creation timestamp, and last-modified timestamp.
2. WHEN the application loads, THE Group_Manager SHALL retrieve all Groups from the Group_Store and make them available to the UI via Redux state.
3. WHEN a Group is updated (transactions added, removed, or metadata changed), THE Group_Store SHALL update the corresponding Group record and set the last-modified timestamp.
4. WHEN a Group is deleted, THE Group_Store SHALL remove the corresponding Group record.

### Requirement 6: Calculate and Display Group Summary

**User Story:** As a user, I want to see the financial summary of a group, so that I can understand the net settlement status at a glance.

#### Acceptance Criteria

1. WHEN a Group is viewed in the Group_Summary_View, THE Group_Manager SHALL calculate the total debit amount by summing the `amount` field of all non-credit transactions in the Group.
2. WHEN a Group is viewed in the Group_Summary_View, THE Group_Manager SHALL calculate the total credit amount by summing the `amount` field of all credit transactions in the Group.
3. THE Group_Summary_View SHALL display the total debits, total credits, and Net_Settlement_Amount for the Group.
4. WHEN the Net_Settlement_Amount equals zero, THE Group_Summary_View SHALL display the Group_Status as "Settled".
5. WHEN the Net_Settlement_Amount is non-zero, THE Group_Summary_View SHALL display the Group_Status as "Unsettled".
6. THE Group_Summary_View SHALL display the Net_Settlement_Amount with a positive value labeled as "Owed to you" and a negative value labeled as "You owe".
7. THE Group_Summary_View SHALL display the Involved_Party name associated with the Group.

### Requirement 7: View Transactions Within a Group

**User Story:** As a user, I want to view all transactions belonging to a group, so that I can review the individual entries that make up the settlement.

#### Acceptance Criteria

1. WHEN the user opens a Group from the Group_List_View or Group_Badge, THE Group_Summary_View SHALL display a list of all transactions belonging to that Group.
2. THE Group_Summary_View SHALL display each transaction's date, narration, type (credit/debit), and amount.
3. WHEN a transaction referenced by a Group no longer exists in the Transaction_Table, THE Group_Summary_View SHALL display that transaction's ID with a "Transaction not found" indicator.

### Requirement 8: Remove Transactions from a Group

**User Story:** As a user, I want to remove transactions from a group, so that I can correct grouping mistakes.

#### Acceptance Criteria

1. WHEN viewing a Group in the Group_Summary_View, THE Group_Summary_View SHALL provide a remove action for each transaction in the Group.
2. WHEN the user removes a transaction from a Group, THE Group_Manager SHALL remove that transaction ID from the Group's transaction list and update the Group in the Group_Store.
3. IF removing a transaction would leave the Group with fewer than two transactions, THEN THE Group_Manager SHALL warn the user that the Group requires at least two transactions and offer to delete the Group instead.

### Requirement 9: Delete a Group

**User Story:** As a user, I want to delete a group entirely, so that I can clean up groups that are no longer relevant.

#### Acceptance Criteria

1. THE Group_List_View SHALL provide a delete action for each Group.
2. WHEN the user initiates a Group deletion, THE Group_Manager SHALL prompt the user for confirmation before proceeding.
3. WHEN the user confirms deletion, THE Group_Manager SHALL remove the Group from the Group_Store and from Redux state.
4. WHEN a Group is deleted, THE Group_Manager SHALL remove Group_Badge indicators from all transactions that belonged to that Group.

### Requirement 10: Display Group Badge and Group Info Icon on Transactions

**User Story:** As a user, I want to see which group a transaction belongs to directly in the transaction table and quickly access group details, so that I can identify grouped transactions and review group information without navigating away.

#### Acceptance Criteria

1. WHEN a transaction belongs to one or more Groups, THE Transaction_Table SHALL display a Group_Badge (MUI Chip) on that transaction's row showing the Group name.
2. WHEN a transaction belongs to multiple Groups, THE Transaction_Table SHALL display one Group_Badge per Group, with overflow handling consistent with the existing label display pattern (show first two, then "+N" indicator).
3. WHEN the user clicks a Group_Badge, THE Group_Summary_View SHALL open for that Group.
4. WHEN a transaction belongs to one or more Groups, THE Transaction_Table SHALL display a Group_Info_Icon on that transaction's row.
5. WHEN the user clicks the Group_Info_Icon, THE Transaction_Table SHALL display a popover or inline panel showing the Group name, Involved_Party, Net_Settlement_Amount, and Group_Status for each Group the transaction belongs to.
6. WHEN the user clicks a Group name within the Group_Info_Icon popover, THE Group_Summary_View SHALL open for that Group.
7. WHEN a transaction does not belong to any Group, THE Transaction_Table SHALL not display a Group_Info_Icon on that transaction's row.

### Requirement 11: Group List View

**User Story:** As a user, I want to see all my transaction groups in one place, so that I can manage and review my settlements, debts, and lendings.

#### Acceptance Criteria

1. THE Group_List_View SHALL be accessible from the Transactions page.
2. THE Group_List_View SHALL display each Group's name, Involved_Party, transaction count, Net_Settlement_Amount, and Group_Status.
3. THE Group_List_View SHALL allow the user to sort Groups by name, status, or net amount.
4. WHEN the user clicks on a Group in the Group_List_View, THE Group_Summary_View SHALL open for that Group.

### Requirement 12: Grouped Transactions Tab

**User Story:** As a user, I want a dedicated tab on the Transactions page to view and track all grouped transactions, so that I can switch between viewing all transactions and focusing on grouped transactions without leaving the page.

#### Acceptance Criteria

1. THE Transaction_Logs_Page SHALL display a tab bar with two tabs: "All Transactions" and "Grouped Transactions".
2. WHEN the Transaction_Logs_Page loads, THE Transaction_Logs_Page SHALL display the "All Transactions" tab as the active default tab.
3. WHEN the user selects the "All Transactions" tab, THE Transaction_Logs_Page SHALL display the existing Transaction_Table with all transactions, pagination, and controls.
4. WHEN the user selects the "Grouped Transactions" tab, THE Transaction_Logs_Page SHALL display the Grouped_Transactions_Tab content showing the Group_List_View.
5. WHILE the "Grouped Transactions" tab is active, THE Grouped_Transactions_Tab SHALL display each Group as a summary card or row showing the Group name, Involved_Party, transaction count, Net_Settlement_Amount, and Group_Status.
6. WHEN the user clicks on a Group in the Grouped_Transactions_Tab, THE Group_Summary_View SHALL open for that Group, displaying the full list of transactions within the Group.
7. WHILE the "Grouped Transactions" tab is active, THE Bulk_Action_Toolbar SHALL not be visible regardless of any prior selection state.

### Requirement 13: Edit Group Metadata

**User Story:** As a user, I want to edit a group's name, involved party, and notes, so that I can keep group information accurate over time.

#### Acceptance Criteria

1. WHEN viewing a Group in the Group_Summary_View, THE Group_Summary_View SHALL provide an edit action for the Group's metadata.
2. WHEN the user clicks the edit action, THE Group_Dialog SHALL open pre-populated with the Group's current name, Involved_Party, and notes.
3. WHEN the user submits updated metadata, THE Group_Manager SHALL update the Group in the Group_Store and in Redux state.
4. IF the user clears the group name field, THEN THE Group_Dialog SHALL display a validation error indicating that the group name is required.

### Requirement 14: Redux State Management for Groups

**User Story:** As a developer, I want Groups managed through Redux, so that the UI stays consistent with the existing state management pattern used for transactions and labels.

#### Acceptance Criteria

1. THE Group_Manager SHALL store all Groups in a dedicated Redux slice (`groupSlice`) with state fields for: groups array, loading status, and error.
2. WHEN a Group is created, updated, or deleted, THE Group_Manager SHALL dispatch the corresponding Redux action to keep the store in sync with the Group_Store.
3. WHEN the application initializes, THE Group_Manager SHALL load all Groups from the Group_Store into the Redux store.

### Requirement 15: IndexedDB Schema Extension for Groups

**User Story:** As a developer, I want a dedicated IndexedDB object store for groups, so that group data is persisted independently from transaction edits.

#### Acceptance Criteria

1. THE Group_Store SHALL be implemented as a new IndexedDB object store named `transaction_groups` within the existing `ExpenseTrackerDB` database.
2. THE Group_Store SHALL use the group ID as the key path.
3. WHEN the database version is upgraded, THE Group_Store SHALL be created without affecting existing `edited_transactions` and `labels` stores.

### Requirement 16: Selection State Reset on Navigation

**User Story:** As a user, I want the selection state to reset when I change pages, filters, or row limits, so that I don't accidentally act on stale selections from a previous view.

#### Acceptance Criteria

1. WHEN the transaction list is reloaded due to a change in `page`, `filters`, or `limit`, THE Transaction_Logs_Page SHALL reset `selectedIds` to an empty array.
2. WHEN `selectedIds` is reset due to navigation, THE Bulk_Action_Toolbar SHALL no longer be visible.

### Requirement 17: Per-Member Expense Splitting and Settlement Tracking

**User Story:** As a user, I want to add multiple members to a group with their individual share and payment amounts, so that I can track who owes me and who I owe after a shared expense like a trip.

#### Acceptance Criteria

1. WHEN creating or editing a Group, THE Group_Dialog SHALL allow adding multiple members, each with a name, share amount, and paid amount.
2. THE Group data model SHALL store a `members` array where each member has `name: string`, `share: number`, `paid: number`, and optional `percentage: number` fields.
3. WHEN a member's `paid` amount exceeds their `share`, THE Group_Summary_View SHALL indicate that the user owes that member the difference.
4. WHEN a member's `paid` amount is less than their `share`, THE Group_Summary_View SHALL indicate that the member still owes the user the difference.
5. WHEN a member's `paid` equals their `share`, THE Group_Summary_View SHALL indicate that member is settled.
6. THE Group_Summary_View SHALL display a per-member settlement breakdown showing each member's name, share, paid amount, and net balance.
7. THE Group_Status SHALL be "Settled" when all members have a net balance of zero.
8. THE `involvedParty` field SHALL be auto-generated as a comma-separated string of member names for backward compatibility.

### Requirement 18: Multiple Split Types

**User Story:** As a user, I want to choose different ways to split expenses (equal, custom, percentage, loan), so that I can handle various real-world scenarios accurately.

#### Acceptance Criteria

1. THE Group_Dialog SHALL provide a split type selection with the following options: Equal Split (Payer Included), Equal Split (Payer Excluded), Custom Amounts, Percentage Split, Loan/Lending, and Itemized Split.
2. WHEN "Equal Split (Payer Included)" is selected, THE system SHALL divide the total equally among all members including the payer.
3. WHEN "Equal Split (Payer Excluded)" is selected, THE system SHALL divide the total equally among all members except the payer (payer's share = 0).
4. WHEN "Custom Amounts" is selected, THE system SHALL allow manual entry of share amounts per member.
5. WHEN "Percentage Split" is selected, THE system SHALL calculate shares based on each member's percentage of the total.
6. WHEN "Loan/Lending" is selected, THE system SHALL set the lender's share to 0 and the borrower's share to the total amount.
7. THE Group_Dialog SHALL provide a "Calculate Shares" button that auto-fills share amounts based on the selected split type.
8. THE Group data model SHALL store the `splitType` as an optional field for backward compatibility.

### Requirement 19: Auto-Calculate Shares and Settlement Suggestions

**User Story:** As a user, I want the system to automatically calculate shares and suggest optimal settlements, so that I don't have to do manual math.

#### Acceptance Criteria

1. WHEN the user clicks "Calculate Shares", THE system SHALL compute share amounts based on the selected split type and total debit amount.
2. THE Group_Dialog SHALL display real-time net calculation per member as a color-coded chip (green = settled, yellow = they owe, red = you owe them).
3. THE Group_Dialog SHALL display a summary showing total paid vs total shares.
4. THE Group_Dialog SHALL warn if total paid doesn't match the transaction total.
5. THE Group_Summary_View SHALL display settlement suggestions showing who should pay whom and how much.
6. THE settlement algorithm SHALL minimize the number of transactions needed to settle the group.

### Requirement 20: Member Name Autocomplete from Existing Groups

**User Story:** As a user, I want member names to auto-suggest from my previous groups, so that I don't have to retype names every time.

#### Acceptance Criteria

1. WHEN adding a member in the Group_Dialog, THE name field SHALL provide autocomplete suggestions extracted from all existing groups' member names and the logged-in user's name.
2. THE autocomplete SHALL support `freeSolo` mode, allowing users to type names not in the suggestion list.
3. THE autocomplete SHALL show an "Add new" option when the typed name doesn't match any existing suggestion.
4. WHEN creating a group in "create" mode, THE Group_Dialog SHALL auto-populate the logged-in user as the first member with the total debit amount as their paid value.

### Requirement 21: Edit Group from Summary View

**User Story:** As a user, I want to edit a group's details directly from the summary view, so that I can update member payments as repayments come in.

#### Acceptance Criteria

1. WHEN the user clicks the edit button in the Group_Summary_View, THE system SHALL close the summary modal and open the Group_Dialog in edit mode.
2. THE Group_Dialog in edit mode SHALL receive the group's transactions (resolved from transactionIds) rather than the currently selected transactions.
3. THE Group_Dialog SHALL be rendered regardless of whether transactions are currently selected (not gated by `selectedIds.length > 0`).
