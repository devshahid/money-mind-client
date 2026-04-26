# Product Overview

Money Mind is a personal finance management web application. Users can:

- Track income and expenses via transaction logs (imported from bank statements or added manually as cash memos)
- Categorize and label transactions with bulk assignment support
- Group transactions (e.g., trips, shared expenses) with multi-member expense splitting
- Split expenses using 6 split types: Equal (payer included/excluded), Custom Amounts, Percentage, Loan/Lending, and Itemized
- Track per-member settlements with auto-calculated shares and settlement suggestions
- View a dashboard with financial summaries and charts (Recharts)
- Manage debts and financial goals
- Toggle between light and dark themes

The app connects to a backend REST API for persistence and uses IndexedDB for offline-first local edits that sync later. Transaction groups and expense splits are stored locally in IndexedDB.

## Key Workflows

- **Bulk Actions**: Select multiple transactions → attach labels, create groups, or add to existing groups
- **Expense Splitting**: Create a group → choose split type → add members with paid amounts → auto-calculate shares → view settlement suggestions
- **Loan Tracking**: Create a loan group → track repayments by updating member paid amounts over time
- **Group Management**: View all groups in "Grouped Transactions" tab → click to see summary → edit/delete groups
