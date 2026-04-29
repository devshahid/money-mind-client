# Implementation Plan: Backend API for Transaction Grouping

## Overview

Implement the backend REST API for transaction groups, expense splitting, and saved members. Follows the existing Money Mind backend patterns: Express.js routes, controller functions, Mongoose models, auth middleware.

## Tasks

- [ ] 1. Create Mongoose models

  - [ ] 1.1 Create `models/TransactionGroup.js`

    - Schema: userId (ObjectId, ref User, required, indexed), clientId (String, required, unique), name (String, required, trim), involvedParty (String, default ""), members (Array of { name, share, paid, percentage }), notes (String), transactionIds (Array of String), splitType (String, enum), splitConfig (Mixed)
    - Enable timestamps (createdAt, updatedAt)
    - Compound unique index on { userId, clientId }
    - _Requirements: 1.9, 1.10_

  - [ ] 1.2 Create `models/SavedMember.js`

    - Schema: userId (ObjectId, ref User, required, indexed), name (String, required, trim)
    - Enable timestamps
    - Compound unique index on { userId, name } with case-insensitive collation
    - _Requirements: 3.6_

- [ ] 2. Create route files

  - [ ] 2.1 Create `routes/transactionGroupRoutes.js`

    - POST `/create` → groupController.createGroup
    - GET `/list` → groupController.listGroups
    - GET `/:id` → groupController.getGroup
    - PUT `/update/:id` → groupController.updateGroup
    - DELETE `/delete/:id` → groupController.deleteGroup
    - PUT `/:id/add-transactions` → groupController.addTransactions
    - PUT `/:id/remove-transaction` → groupController.removeTransaction
    - PUT `/sync` → groupController.syncGroups
    - All routes protected by auth middleware
    - _Requirements: 1.1-1.6_

  - [ ] 2.2 Create `routes/memberRoutes.js`

    - POST `/create` → memberController.createMember
    - GET `/list` → memberController.listMembers
    - DELETE `/delete/:id` → memberController.deleteMember
    - All routes protected by auth middleware
    - _Requirements: 3.1-3.3_

  - [ ] 2.3 Register routes in main app

    - Mount `/api/v1/transaction-groups` → transactionGroupRoutes
    - Mount `/api/v1/members` → memberRoutes

- [ ] 3. Implement group controller

  - [ ] 3.1 `createGroup` — Validate required fields, extract userId from token, create document, return with `{ output: group }`

    - Validate: name non-empty, clientId present, members[].name non-empty, share/paid >= 0, splitType in enum
    - _Requirements: 1.1, 1.6, 1.7, 1.8, 1.9, 6.1_

  - [ ] 3.2 `listGroups` — Find all groups where userId matches, sort by updatedAt desc

    - _Requirements: 1.2, 1.7_

  - [ ] 3.3 `getGroup` — Find by \_id or clientId, verify userId ownership

    - _Requirements: 1.3, 1.7, 6.3_

  - [ ] 3.4 `updateGroup` — Find by \_id or clientId, verify ownership, apply partial update, save

    - Validate same rules as create for any provided fields
    - Mongoose timestamps auto-update updatedAt
    - _Requirements: 1.4, 1.10, 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.5 `deleteGroup` — Find by \_id or clientId, verify ownership, delete

    - _Requirements: 1.5_

  - [ ] 3.6 `addTransactions` — Find group, append transactionIds (deduplicate), save

    - _Requirements: 4.1, 4.3, 4.4_

  - [ ] 3.7 `removeTransaction` — Find group, filter out transactionId, save

    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 3.8 `syncGroups` — For each group in request: upsert by { userId, clientId }, last-write-wins on updatedAt, return full list
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Implement member controller

  - [ ] 4.1 `createMember` — Validate name non-empty, check uniqueness (case-insensitive), create, return

    - _Requirements: 3.1, 3.4, 3.5, 3.6_

  - [ ] 4.2 `listMembers` — Find all by userId, sort by name asc

    - _Requirements: 3.2_

  - [ ] 4.3 `deleteMember` — Find by \_id, verify ownership, delete
    - _Requirements: 3.3, 3.7_

- [ ] 5. Add validation middleware (optional)

  - [ ] 5.1 Create reusable validation helpers for group and member payloads
    - Validate member array structure
    - Validate splitType enum
    - Validate numeric fields (share, paid, percentage)
    - _Requirements: 6.1_

- [ ] 6. Testing

  - [ ] 6.1 Write integration tests for group CRUD endpoints
  - [ ] 6.2 Write integration tests for member CRUD endpoints
  - [ ] 6.3 Write tests for sync endpoint (create, update, conflict resolution)
  - [ ] 6.4 Write tests for auth enforcement (401 without token)
  - [ ] 6.5 Write tests for validation errors (400 responses)
  - [ ] 6.6 Write tests for ownership enforcement (404 for other user's data)

## File Structure (Expected)

```
backend/
├── models/
│   ├── TransactionGroup.js    # Mongoose model
│   └── SavedMember.js         # Mongoose model
├── controllers/
│   ├── groupController.js     # Group CRUD + sync logic
│   └── memberController.js    # Member CRUD
├── routes/
│   ├── transactionGroupRoutes.js
│   └── memberRoutes.js
├── middleware/
│   └── auth.js                # Existing auth middleware
└── app.js                     # Route registration
```

## Notes

- The `clientId` field maps to the frontend's `id` (crypto.randomUUID). This allows offline-created groups to sync without ID conflicts.
- The `_id` (MongoDB ObjectId) is the server's primary key. The frontend should store both `_id` and `clientId` after sync.
- Member names in groups are plain strings, not references to SavedMember documents. Deleting a saved member doesn't cascade to groups.
- The sync endpoint uses last-write-wins. For a single-user app this is sufficient. Multi-device conflict resolution can be enhanced later.
