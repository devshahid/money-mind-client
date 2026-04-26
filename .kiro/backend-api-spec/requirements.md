# Requirements: Backend API for Transaction Grouping & Expense Splitting

## Introduction

This document defines the backend API requirements for supporting transaction grouping and expense splitting features in the Money Mind application. The frontend currently stores groups locally in IndexedDB. These APIs will enable server-side persistence, cross-device sync, and a saved members directory for autocomplete.

The backend follows existing conventions: Express/Node.js, MongoDB, REST API with `{ output: <data> }` response shape, `accessToken` header authentication, and resource-based routing under `/api/v1`.

## Glossary

- **Transaction_Group**: A named collection of transactions with members, split configuration, and settlement tracking. Stored per-user.
- **Group_Member**: A participant in a group with name, share (what they owe), paid (what they've returned), and optional percentage.
- **Saved_Member**: A reusable member name stored per-user for autocomplete suggestions when creating groups.
- **Split_Type**: The method used to divide expenses: EQUAL_INCLUDE_PAYER, EQUAL_EXCLUDE_PAYER, CUSTOM_AMOUNTS, PERCENTAGE_SPLIT, LOAN, ITEMIZED.
- **Settlement**: The calculated net balance per member (paid - share). Positive = overpaid, negative = underpaid.

## Requirements

### Requirement 1: Transaction Group CRUD API

**User Story:** As a user, I want my transaction groups persisted on the server, so that they sync across devices and survive browser data clears.

#### Acceptance Criteria

1. `POST /transaction-groups/create` SHALL create a new group with fields: name, involvedParty, members[], notes, transactionIds[], splitType, splitConfig.
2. `GET /transaction-groups/list` SHALL return all groups belonging to the authenticated user, sorted by updatedAt descending.
3. `GET /transaction-groups/:id` SHALL return a single group by ID, only if it belongs to the authenticated user.
4. `PUT /transaction-groups/update/:id` SHALL update a group's fields (name, involvedParty, members, notes, transactionIds, splitType, splitConfig).
5. `DELETE /transaction-groups/delete/:id` SHALL delete a group by ID.
6. All endpoints SHALL require authentication via `accessToken` header.
7. All endpoints SHALL scope data to the authenticated user (userId from token).
8. All responses SHALL follow the `{ output: <data> }` response shape.
9. Created groups SHALL include server-generated `_id`, `createdAt`, and `updatedAt` fields.
10. Updated groups SHALL refresh the `updatedAt` timestamp.

### Requirement 2: Group Member Management within Groups

**User Story:** As a user, I want to update individual member payment status within a group, so that I can track repayments over time without replacing the entire group.

#### Acceptance Criteria

1. `PUT /transaction-groups/update/:id` SHALL support partial updates to the `members` array.
2. WHEN a member's `paid` field is updated, THE API SHALL recalculate and return the updated group.
3. THE API SHALL validate that member names within a group are unique (case-insensitive).
4. THE API SHALL validate that `share` and `paid` values are non-negative numbers.

### Requirement 3: Saved Members Directory API

**User Story:** As a user, I want to save a list of member names that persist across sessions, so that they auto-populate when I create groups.

#### Acceptance Criteria

1. `POST /members/create` SHALL create a new saved member with a `name` field, scoped to the authenticated user.
2. `GET /members/list` SHALL return all saved members for the authenticated user, sorted by name ascending.
3. `DELETE /members/delete/:id` SHALL delete a saved member by ID.
4. THE API SHALL validate that member names are unique per user (case-insensitive).
5. THE API SHALL validate that member names are non-empty and trimmed.
6. Created members SHALL include server-generated `_id`, `name`, and `createdAt` fields.
7. Deleting a saved member SHALL NOT affect existing groups that reference that member name.

### Requirement 4: Add/Remove Transactions from Group

**User Story:** As a user, I want to add or remove transactions from an existing group via API, so that I can manage group membership without replacing the entire transaction list.

#### Acceptance Criteria

1. `PUT /transaction-groups/:id/add-transactions` SHALL append transaction IDs to the group, deduplicating against existing IDs.
2. `PUT /transaction-groups/:id/remove-transaction` SHALL remove a single transaction ID from the group.
3. THE API SHALL validate that the group exists and belongs to the authenticated user.
4. THE API SHALL return the updated group after modification.

### Requirement 5: Group Sync (Bulk Upsert)

**User Story:** As a user, I want to sync my locally-stored groups to the server in bulk, so that offline-created groups are persisted when I come back online.

#### Acceptance Criteria

1. `PUT /transaction-groups/sync` SHALL accept an array of group objects and upsert them (create if new, update if existing by `id`).
2. THE API SHALL use the group `id` field (client-generated UUID) as the unique identifier for matching.
3. THE API SHALL return the full list of groups after sync.
4. THE API SHALL handle conflicts by using the most recent `updatedAt` timestamp (last-write-wins).

### Requirement 6: Validation and Error Handling

**User Story:** As a developer, I want consistent validation and error responses, so that the frontend can display meaningful error messages.

#### Acceptance Criteria

1. THE API SHALL return `400 Bad Request` with a descriptive message for validation errors (missing required fields, invalid types, duplicate names).
2. THE API SHALL return `401 Unauthorized` when the `accessToken` is missing or invalid.
3. THE API SHALL return `404 Not Found` when a group or member ID doesn't exist or doesn't belong to the user.
4. THE API SHALL return `500 Internal Server Error` for unexpected failures.
5. Error responses SHALL follow the shape `{ error: string, message: string }`.
