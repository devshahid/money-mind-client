# Requirements Document

## Introduction

When multiple rows are selected in the transaction table, the per-row edit button should be disabled to prevent users from opening the single-transaction edit modal during a multi-selection. This is a small UI guard that keeps the editing workflow consistent and avoids confusion.

## Glossary

- **Transaction_Table**: The `CustomTable` component (`src/components/Table.tsx`) that renders transaction rows with selection checkboxes and action buttons.
- **Edit_Button**: The `IconButton` with `EditIcon` rendered in the "Action" column of each row when the table type is "full".
- **Selected_Ids**: The array of currently selected transaction row IDs, managed in `TransactionLogs` state and passed to the Transaction_Table via the `selectedIds` prop.

## Requirements

### Requirement 1: Disable edit button on multi-row selection

**User Story:** As a user, I want the edit button to be disabled when more than one row is selected, so that I do not accidentally open a single-transaction edit modal while performing a bulk selection.

#### Acceptance Criteria

1. WHILE Selected_Ids contains more than one entry, THE Edit_Button SHALL be disabled for every row in the Transaction_Table.
2. WHILE Selected_Ids contains zero or one entry, THE Edit_Button SHALL remain enabled for every row in the Transaction_Table.
3. WHEN the Edit_Button is disabled, THE Edit_Button SHALL display a visual disabled state (reduced opacity or grayed-out appearance) to indicate it is not interactive.
4. WHEN the Edit_Button is disabled, THE Edit_Button SHALL prevent invocation of the edit click handler upon user interaction.
5. WHEN a user deselects rows such that Selected_Ids contains one or fewer entries, THE Edit_Button SHALL return to the enabled state immediately.
