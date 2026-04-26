# Requirements Document

## Introduction

Money Mind is an existing personal finance management application with login, dashboard, transaction logs, debts, and goals pages. The frontend is built with React, TypeScript, Redux Toolkit, and uses IndexedDB for local edits alongside a REST API backend. This upgrade introduces a comprehensive set of features: bank statement uploads, enriched transaction management (notes, categories, labels), transaction grouping, persistent server-side storage, debt management with EMI planning, savings goals, budget management, analytics, and an AI agentic workflow layer that assists across all modules.

---

## Glossary

- **App**: The Money Mind personal finance management application.
- **User**: An authenticated person using the App.
- **Statement**: A bank-exported file (CSV, XLS, XLSX, or PDF) containing a list of transactions.
- **Transaction**: A single financial record with a date, narration, amount, credit/debit type, and bank source.
- **Transaction_Group**: A named collection of two or more Transactions linked together to represent a related financial event (e.g., a loan given and its repayments).
- **Group_Balance**: The net amount of a Transaction_Group, calculated as the sum of credits minus the sum of debits within the group.
- **Annotation**: User-supplied metadata attached to a Transaction, consisting of a note, a category, and one or more labels.
- **Category**: A predefined or user-defined classification for a Transaction (e.g., Shopping, Fuel, EMI, Personal).
- **Label**: A freeform tag applied to a Transaction (e.g., lend, banking, personal, travel).
- **Bank**: A financial institution whose Statement the User uploads; identified by a user-supplied name.
- **Debt**: A loan or credit obligation tracked by the App, with principal, interest rate, EMI schedule, and lender details.
- **EMI**: Equated Monthly Instalment — a fixed periodic payment toward a Debt.
- **Goal**: A named savings target with a target amount and optional deadline.
- **Budget**: A monthly or periodic spending limit assigned to one or more Categories.
- **AI_Agent**: The AI-powered assistant integrated into the App that provides automated suggestions and insights across all modules.
- **Dashboard**: The main overview page showing financial summaries, recent Transactions, active Goals, and Debt status.
- **IndexedDB**: The browser-side storage used for optimistic local edits before server sync.
- **Sync**: The process of persisting locally edited Transactions to the backend database.

---

## Requirements

### Requirement 1: Bank Statement Upload

**User Story:** As a User, I want to upload bank statements from multiple banks, so that I can import all my past and current transactions into the App without manual data entry.

#### Acceptance Criteria

1. WHEN the User initiates a statement upload, THE App SHALL present a file picker that accepts CSV, XLS, XLSX, and PDF file formats.
2. WHEN the User selects a file, THE App SHALL prompt the User to enter or select a Bank name before processing the file.
3. WHEN the User confirms the Bank name and submits the file, THE App SHALL parse the Statement and extract all Transactions contained within it.
4. WHEN a Statement is successfully parsed, THE App SHALL associate every extracted Transaction with the supplied Bank name.
5. WHEN a Statement is successfully parsed, THE App SHALL display a preview of the extracted Transactions before final import, showing transaction date, narration, amount, and type.
6. WHEN the User confirms the import preview, THE App SHALL persist all extracted Transactions to the backend database.
7. IF a Statement file is malformed or in an unsupported format, THEN THE App SHALL display a descriptive error message and SHALL NOT import any Transactions.
8. IF a duplicate Transaction (same date, narration, amount, and bank) already exists in the database, THEN THE App SHALL flag it in the preview and allow the User to skip or overwrite it.
9. WHEN Transactions are imported, THE Bank name SHALL become available as a filter option in the Transactions filter panel.
10. THE App SHALL support uploading Statements from multiple Banks, with each Bank's Transactions stored and filterable independently.

---

### Requirement 2: Transaction Annotation

**User Story:** As a User, I want to add notes, categories, and labels to my transactions, so that I can understand and classify my spending history.

#### Acceptance Criteria

1. WHEN the User opens a Transaction, THE App SHALL display an edit panel containing fields for note, category, and labels.
2. WHEN the User saves an Annotation, THE App SHALL persist the note, category, and labels to the backend database and update the Transaction record immediately in the UI.
3. THE App SHALL provide a predefined list of Categories including at minimum: Food, Groceries, Fuel, Travel, Medical, Entertainment, Shopping, Bills & Utilities, EMI, Rent, Family, Personal, Income, Lending, Borrowed, Insurance, Taxes, Gifts & Donations, and Other.
4. THE App SHALL allow the User to type a custom Category not present in the predefined list.
5. THE App SHALL allow the User to assign multiple Labels to a single Transaction.
6. THE App SHALL allow the User to create new Labels by typing freeform text in the label field.
7. WHEN the User filters Transactions by Category or Label, THE App SHALL return only Transactions matching all selected filter values.
8. WHILE a Sync is in progress, THE App SHALL store Annotation changes in IndexedDB and reflect them immediately in the UI without waiting for the server response.
9. WHEN the Sync completes successfully, THE App SHALL remove the locally stored Annotation changes from IndexedDB.
10. IF the Sync fails, THEN THE App SHALL retain the Annotation changes in IndexedDB and display a sync error notification to the User.

---

### Requirement 3: Persistent Storage and State Management

**User Story:** As a User, I want all my data to be saved to the server and reflected instantly in the UI, so that I never lose my work and the app feels responsive.

#### Acceptance Criteria

1. THE App SHALL persist all Transactions, Annotations, Transaction_Groups, Debts, Goals, and Budgets to the backend database.
2. WHEN the User refreshes the browser, THE App SHALL restore all data from the backend database without data loss.
3. WHEN the User performs any create, update, or delete action, THE App SHALL update the Redux store immediately (optimistic update) before the server response is received.
4. IF a server request fails after an optimistic update, THEN THE App SHALL revert the Redux store to its previous state and display an error notification.
5. WHEN the backend returns a successful response, THE App SHALL reconcile the Redux store with the server response to ensure consistency.
6. THE App SHALL use IndexedDB to queue Annotation edits when the User is offline or the server is unreachable, and SHALL sync them automatically when connectivity is restored.

---

### Requirement 4: Transaction Grouping

**User Story:** As a User, I want to group related transactions together, so that I can track multi-part financial events like loans given and repayments received as a single balanced view.

#### Acceptance Criteria

1. WHEN the User selects two or more Transactions, THE App SHALL offer an option to create a Transaction_Group from the selection.
2. WHEN creating a Transaction_Group, THE App SHALL require the User to provide a group name.
3. WHEN a Transaction_Group is created, THE App SHALL calculate and display the Group_Balance as the sum of all credit amounts minus the sum of all debit amounts within the group.
4. THE App SHALL allow Transactions from different Banks to be included in the same Transaction_Group.
5. WHEN the User views the Transactions list, THE App SHALL visually distinguish grouped Transactions from ungrouped ones.
6. WHEN the User clicks on a Transaction_Group, THE App SHALL display a detailed view listing all member Transactions, the Group_Balance, and the group name.
7. WHEN the User clicks on an individual Transaction within a group, THE App SHALL display the full Transaction detail view.
8. THE App SHALL allow the User to add additional Transactions to an existing Transaction_Group.
9. THE App SHALL allow the User to remove a Transaction from a Transaction_Group without deleting the Transaction itself.
10. THE App SHALL allow the User to dissolve a Transaction_Group, which removes the grouping but retains all member Transactions.
11. WHEN the Group_Balance equals zero, THE App SHALL indicate that the group is fully settled.
12. IF a Transaction is already a member of a Transaction_Group, THEN THE App SHALL prevent it from being added to a second Transaction_Group and SHALL display an informative message.

---

### Requirement 5: Debt Management

**User Story:** As a User, I want to track all my loans and EMI schedules, so that I can plan my debt clearance and work toward becoming debt-free.

#### Acceptance Criteria

1. THE App SHALL allow the User to create a Debt record containing: debt name, lender name, principal amount, interest rate, start date, expected end date, monthly expected EMI, and debt status.
2. WHEN a Debt is created, THE App SHALL calculate and display the total interest payable over the loan term based on the principal and interest rate.
3. WHEN the User records an EMI payment against a Debt, THE App SHALL update the remaining balance and recalculate the projected payoff date.
4. THE App SHALL display all active Debts on the Debt page with columns for debt name, lender, total amount, remaining amount, interest rate, monthly EMI, next payment date, and status.
5. WHEN the next EMI payment date is within 5 days, THE App SHALL display a reminder notification on the Dashboard.
6. THE App SHALL provide a debt payoff planner that shows the User the projected debt-free date given current EMI payments.
7. THE App SHALL allow the User to record part-payments against a Debt, and SHALL recalculate the remaining balance and projected payoff date accordingly.
8. WHEN a Debt's remaining balance reaches zero, THE App SHALL automatically update the debt status to "Paid Off".
9. THE App SHALL allow the User to link a Transaction to a Debt as an EMI payment, so that the payment is reflected in both the Transaction list and the Debt record.
10. IF the User attempts to delete a Debt that has linked Transactions, THEN THE App SHALL warn the User and require explicit confirmation before deletion.

---

### Requirement 6: Savings Goals

**User Story:** As a User, I want to define savings goals with target amounts and deadlines, so that I can track my progress toward specific financial objectives.

#### Acceptance Criteria

1. THE App SHALL allow the User to create a Goal with a name, target amount, optional deadline, and optional description.
2. THE App SHALL allow the User to record contributions toward a Goal, each with an amount and date.
3. WHEN a contribution is recorded, THE App SHALL update the Goal's current saved amount and recalculate the remaining amount needed.
4. THE App SHALL display each Goal's name, target amount, current saved amount, remaining amount, percentage progress, and deadline on the Goals page.
5. WHEN a Goal's current saved amount equals or exceeds the target amount, THE App SHALL mark the Goal as achieved.
6. THE App SHALL display active Goals as progress indicators on the Dashboard.
7. WHEN a Goal has a deadline and the current saved amount is insufficient to meet the target by the deadline at the current contribution rate, THE App SHALL display a warning on the Goal detail view.
8. THE App SHALL allow the User to link a Transaction to a Goal contribution, so that the contribution is reflected in both the Transaction list and the Goal record.

---

### Requirement 7: Budget Management

**User Story:** As a User, I want to set spending budgets per category for each month, so that I can control my expenses and stay within my financial limits.

#### Acceptance Criteria

1. THE App SHALL allow the User to create a Budget by selecting a Category, entering a spending limit amount, and selecting a month and year.
2. WHEN Transactions are loaded for a given month, THE App SHALL calculate the total spending per Category and compare it against the corresponding Budget limit.
3. THE App SHALL display each Budget on the Budget page with the Category name, budget limit, amount spent, amount remaining, and a visual progress indicator.
4. WHEN spending in a Category reaches 80% of the Budget limit for that month, THE App SHALL display a warning indicator on the Budget page and the Dashboard.
5. WHEN spending in a Category exceeds the Budget limit for that month, THE App SHALL display an over-budget indicator on the Budget page and the Dashboard.
6. THE App SHALL allow the User to copy Budgets from a previous month to the current month.
7. THE App SHALL allow the User to edit or delete an existing Budget.

---

### Requirement 8: Analytics

**User Story:** As a User, I want to view charts and summaries of my financial data, so that I can understand my spending patterns and financial health over time.

#### Acceptance Criteria

1. THE App SHALL display a monthly income vs. expense bar chart on the Analytics page, covering the last 12 months.
2. THE App SHALL display a Category-wise spending breakdown as a pie or donut chart for a user-selected time period.
3. THE App SHALL display a net savings trend line chart showing monthly net savings (income minus expenses) over the last 12 months.
4. THE App SHALL display a Debt repayment progress chart showing remaining balance over time for each active Debt.
5. THE App SHALL display a Goals progress summary showing current saved amount vs. target for each active Goal.
6. WHEN the User selects a date range filter on the Analytics page, THE App SHALL recalculate and re-render all charts to reflect only Transactions within the selected range.
7. WHEN the User selects a Bank filter on the Analytics page, THE App SHALL recalculate and re-render all charts to reflect only Transactions from the selected Bank.
8. THE Dashboard SHALL display summary cards showing: total balance, total income for the current month, total expenses for the current month, and total active Goal savings.

---

### Requirement 9: AI Agentic Workflow

**User Story:** As a User, I want an AI assistant to help me categorize transactions, suggest groupings, plan debt payoff, and advise on goals, so that I can manage my finances more efficiently with less manual effort.

#### Acceptance Criteria

1. WHEN new Transactions are imported from a Statement, THE AI_Agent SHALL suggest a Category and one or more Labels for each Transaction based on the narration text.
2. THE App SHALL display AI-suggested Categories and Labels on the Transaction annotation panel, and the User SHALL be able to accept, modify, or reject each suggestion individually.
3. WHEN the User views the Transactions list, THE AI_Agent SHALL identify Transactions that are likely related and suggest them as candidates for a Transaction_Group.
4. THE App SHALL display AI-suggested Transaction_Group candidates with a confidence indicator, and the User SHALL be able to accept or dismiss each suggestion.
5. WHEN the User views the Debt page, THE AI_Agent SHALL generate a debt payoff strategy recommending the optimal order to pay off Debts (e.g., avalanche or snowball method) based on interest rates and remaining balances.
6. WHEN the User views a Goal, THE AI_Agent SHALL suggest a monthly contribution amount required to meet the Goal by its deadline.
7. WHEN the User views the Budget page, THE AI_Agent SHALL identify Categories where spending consistently exceeds the Budget and suggest revised Budget limits or spending reductions.
8. THE App SHALL provide a conversational AI chat interface where the User can ask questions about their financial data and receive answers grounded in their actual Transactions, Debts, Goals, and Budgets.
9. IF the AI_Agent cannot determine a suggestion with sufficient confidence, THEN THE AI_Agent SHALL indicate low confidence rather than presenting an uncertain suggestion as definitive.
10. THE App SHALL allow the User to provide feedback on AI suggestions (accept/reject), and THE AI_Agent SHALL use this feedback to improve future suggestions within the same session.
