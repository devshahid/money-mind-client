# Design Document: Backend API for Transaction Grouping

## Overview

This document defines the backend API design for transaction grouping, expense splitting, and saved members features. The API follows the existing Money Mind backend conventions: Express.js, MongoDB with Mongoose, JWT-based auth via `accessToken` header, and `{ output: <data> }` response shape.

## Architecture

```
Routes                    Controllers                 Models
──────                    ───────────                 ──────
/transaction-groups/*  →  groupController.ts       →  TransactionGroup (MongoDB)
/members/*             →  memberController.ts      →  SavedMember (MongoDB)
```

All routes are protected by the existing auth middleware that extracts `userId` from the `accessToken` header.

## Data Models

### TransactionGroup (MongoDB Schema)

```javascript
const TransactionGroupSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Client-generated UUID — used for offline sync matching
        clientId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        involvedParty: {
            type: String,
            default: "",
            trim: true,
        },
        members: [
            {
                name: { type: String, required: true, trim: true },
                share: { type: Number, default: 0, min: 0 },
                paid: { type: Number, default: 0, min: 0 },
                percentage: { type: Number, default: 0, min: 0, max: 100 },
            },
        ],
        notes: {
            type: String,
            default: "",
        },
        transactionIds: [
            {
                type: String,
            },
        ],
        splitType: {
            type: String,
            enum: ["EQUAL_INCLUDE_PAYER", "EQUAL_EXCLUDE_PAYER", "CUSTOM_AMOUNTS", "PERCENTAGE_SPLIT", "LOAN", "ITEMIZED"],
            default: "EQUAL_INCLUDE_PAYER",
        },
        splitConfig: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt, updatedAt
    },
);

// Compound index for user + clientId uniqueness
TransactionGroupSchema.index({ userId: 1, clientId: 1 }, { unique: true });
```

### SavedMember (MongoDB Schema)

```javascript
const SavedMemberSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true, // adds createdAt, updatedAt
    },
);

// Compound index for unique member names per user (case-insensitive)
SavedMemberSchema.index({ userId: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
```

## API Endpoints

### Transaction Groups

#### POST /transaction-groups/create

Creates a new transaction group.

**Request Body:**

```json
{
    "clientId": "uuid-from-frontend",
    "name": "Goa Trip",
    "involvedParty": "Alice, Bob, Charlie",
    "members": [
        { "name": "Alice", "share": 10000, "paid": 20000, "percentage": 0 },
        { "name": "Bob", "share": 10000, "paid": 7000, "percentage": 0 },
        { "name": "Charlie", "share": 10000, "paid": 3000, "percentage": 0 }
    ],
    "notes": "Trip expenses Dec 2025",
    "transactionIds": ["txn_abc123", "txn_def456"],
    "splitType": "CUSTOM_AMOUNTS",
    "splitConfig": null
}
```

**Response (201):**

```json
{
    "output": {
        "_id": "mongo_object_id",
        "clientId": "uuid-from-frontend",
        "userId": "user_object_id",
        "name": "Goa Trip",
        "involvedParty": "Alice, Bob, Charlie",
        "members": [...],
        "notes": "Trip expenses Dec 2025",
        "transactionIds": ["txn_abc123", "txn_def456"],
        "splitType": "CUSTOM_AMOUNTS",
        "splitConfig": null,
        "createdAt": "2025-12-15T10:00:00.000Z",
        "updatedAt": "2025-12-15T10:00:00.000Z"
    }
}
```

**Validation:**

- `name` required, non-empty
- `clientId` required, must be unique per user
- `members[].name` required, non-empty
- `members[].share` and `members[].paid` must be >= 0
- `splitType` must be one of the enum values

---

#### GET /transaction-groups/list

Returns all groups for the authenticated user.

**Response (200):**

```json
{
    "output": [
        {
            "_id": "...",
            "clientId": "...",
            "name": "Goa Trip",
            "involvedParty": "Alice, Bob, Charlie",
            "members": [...],
            "notes": "...",
            "transactionIds": [...],
            "splitType": "CUSTOM_AMOUNTS",
            "splitConfig": null,
            "createdAt": "...",
            "updatedAt": "..."
        }
    ]
}
```

---

#### GET /transaction-groups/:id

Returns a single group by MongoDB `_id` or `clientId`.

**Response (200):** Same shape as create response.

**Response (404):**

```json
{ "error": "NotFound", "message": "Group not found" }
```

---

#### PUT /transaction-groups/update/:id

Updates a group. Accepts partial updates.

**Request Body (partial):**

```json
{
    "name": "Goa Trip 2025",
    "members": [
        { "name": "Alice", "share": 10000, "paid": 20000 },
        { "name": "Bob", "share": 10000, "paid": 10000 }
    ]
}
```

**Response (200):** Returns the full updated group.

---

#### DELETE /transaction-groups/delete/:id

Deletes a group by `_id` or `clientId`.

**Response (200):**

```json
{ "output": { "message": "Group deleted successfully" } }
```

---

#### PUT /transaction-groups/:id/add-transactions

Appends transaction IDs to a group (deduplicates).

**Request Body:**

```json
{
    "transactionIds": ["txn_ghi789", "txn_jkl012"]
}
```

**Response (200):** Returns the full updated group.

---

#### PUT /transaction-groups/:id/remove-transaction

Removes a single transaction ID from a group.

**Request Body:**

```json
{
    "transactionId": "txn_abc123"
}
```

**Response (200):** Returns the full updated group.

---

#### PUT /transaction-groups/sync

Bulk upsert groups from offline storage.

**Request Body:**

```json
{
    "groups": [
        {
            "clientId": "uuid-1",
            "name": "Trip",
            "members": [...],
            "transactionIds": [...],
            "splitType": "EQUAL_INCLUDE_PAYER",
            "updatedAt": "2025-12-15T10:00:00.000Z"
        }
    ]
}
```

**Response (200):**

```json
{
    "output": {
        "synced": 3,
        "created": 1,
        "updated": 2,
        "groups": [...]
    }
}
```

**Conflict resolution:** Last-write-wins based on `updatedAt`. If the incoming `updatedAt` is newer than the server's, the server record is overwritten.

---

### Saved Members

#### POST /members/create

**Request Body:**

```json
{ "name": "Alice" }
```

**Response (201):**

```json
{
    "output": {
        "_id": "mongo_object_id",
        "name": "Alice",
        "createdAt": "2025-12-15T10:00:00.000Z"
    }
}
```

**Validation:**

- `name` required, non-empty, trimmed
- Duplicate names per user rejected (case-insensitive) → 400

---

#### GET /members/list

**Response (200):**

```json
{
    "output": [
        { "_id": "...", "name": "Alice", "createdAt": "..." },
        { "_id": "...", "name": "Bob", "createdAt": "..." }
    ]
}
```

Sorted by `name` ascending.

---

#### DELETE /members/delete/:id

**Response (200):**

```json
{ "output": { "message": "Member deleted successfully" } }
```

---

## Field Mapping: Frontend ↔ Backend

| Frontend (ITransactionGroup) | Backend (TransactionGroup) | Notes                                         |
| ---------------------------- | -------------------------- | --------------------------------------------- |
| `id` (crypto.randomUUID)     | `clientId`                 | Client-generated UUID, used for sync matching |
| —                            | `_id`                      | Server-generated MongoDB ObjectId             |
| —                            | `userId`                   | Extracted from auth token, not sent by client |
| `name`                       | `name`                     | Required, non-empty                           |
| `involvedParty`              | `involvedParty`            | Auto-generated from member names              |
| `members[]`                  | `members[]`                | Array of { name, share, paid, percentage }    |
| `notes`                      | `notes`                    | Optional                                      |
| `transactionIds[]`           | `transactionIds[]`         | Array of transaction `_id` strings            |
| `splitType`                  | `splitType`                | Enum string, optional                         |
| `splitConfig`                | `splitConfig`              | Mixed/JSON, optional                          |
| `createdAt`                  | `createdAt`                | ISO string, set by Mongoose timestamps        |
| `updatedAt`                  | `updatedAt`                | ISO string, set by Mongoose timestamps        |

| Frontend (IMember) | Backend (members[]) | Notes                  |
| ------------------ | ------------------- | ---------------------- |
| `name`             | `name`              | Required               |
| `share`            | `share`             | Number >= 0            |
| `paid`             | `paid`              | Number >= 0            |
| `percentage`       | `percentage`        | Number 0-100, optional |

| Frontend (ISavedMember) | Backend (SavedMember) | Notes                              |
| ----------------------- | --------------------- | ---------------------------------- |
| `_id`                   | `_id`                 | MongoDB ObjectId                   |
| `name`                  | `name`                | Unique per user (case-insensitive) |
| `createdAt`             | `createdAt`           | ISO string                         |

## Frontend Integration Changes Needed

The frontend now implements the offline-first pattern (Option B) for groups:

1. **All group operations (create, update, delete, add/remove transactions) write to IndexedDB first** and set `isLocalGroups = true` in Redux.
2. **A sync icon appears** on the Grouped Transactions tab when `isLocalGroups` is true.
3. **User clicks sync** → `syncGroups` thunk sends all local groups to `PUT /transaction-groups/sync` → on success, clears local IndexedDB and replaces with server state, sets `isLocalGroups = false`.
4. **On page load**, groups are loaded from IndexedDB. If any exist, `isLocalGroups` is set to true.

This matches the existing transaction edit sync pattern (`isLocalTransactions` → sync button → `syncTransactions` API call).

### Already implemented in frontend:

- `syncGroups` async thunk in `groupSlice.ts` — calls `PUT /transaction-groups/sync`
- `isLocalGroups` and `groupSyncStatus` state fields
- `setIsLocalGroups` and `resetGroupSyncStatus` reducers
- Sync button with spinner on Grouped Transactions tab
- Success/error snackbar notifications after sync

### Still needed when backend is ready:

- Create `src/services/memberService.ts` — API calls for saved member CRUD
- Create `src/store/memberSlice.ts` — Redux slice with `fetchMembers`, `createMember`, `deleteMember` thunks
- Update `src/store/index.ts` — Register `memberReducer`
- Create `src/components/MemberManager.tsx` — UI for managing saved members
- Update `src/components/GroupDialog.tsx` — Accept `savedMembers` prop for autocomplete (currently uses existing group members)
- Update `src/pages/TransactionLogs.tsx` — Fetch members on mount, pass to GroupDialog, add "Manage Members" button

## Error Handling

| Status | When                          | Response Shape                                 |
| ------ | ----------------------------- | ---------------------------------------------- |
| 201    | Resource created              | `{ output: <resource> }`                       |
| 200    | Success                       | `{ output: <data> }`                           |
| 400    | Validation error              | `{ error: "ValidationError", message: "..." }` |
| 401    | Missing/invalid token         | `{ error: "Unauthorized", message: "..." }`    |
| 404    | Resource not found            | `{ error: "NotFound", message: "..." }`        |
| 409    | Duplicate (e.g., member name) | `{ error: "Conflict", message: "..." }`        |
| 500    | Server error                  | `{ error: "InternalError", message: "..." }`   |
