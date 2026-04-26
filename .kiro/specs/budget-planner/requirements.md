# Requirements Document

## Introduction

The Budget Planner feature enables users to create monthly spending budgets broken down by expense category, automatically carry forward budgets to new months, edit budgets at any time, and compare planned budget amounts against actual spending parsed from transaction logs. The feature provides a category-level breakdown of planned vs actual spending for each month, supporting future dashboard and analytics integration.

## Glossary

- **Budget_Planner**: The system component responsible for creating, storing, editing, and displaying monthly budget plans and their comparison with actual spending.
- **Monthly_Budget**: A budget record associated with a specific month and year (e.g., March 2026), containing a list of category-level budget allocations.
- **Budget_Allocation**: A single entry within a Monthly_Budget that specifies the planned spending amount for one expense category.
- **Category**: An expense classification as defined by the existing `getExpenseCategories()` function (e.g., Food, Groceries, Fuel, Travel, Medical, Entertainment, Shopping, Bills & Utilities, etc.).
- **Transaction_Log**: An existing transaction record (`ITransactionLogs`) containing fields such as transactionDate, category, amount, and isCredit.
- **Actual_Spending**: The sum of debit transaction amounts from Transaction_Logs for a given category within a specific month.
- **Budget_Variance**: The difference between a Budget_Allocation planned amount and the corresponding Actual_Spending for that category in that month.
- **Auto_Copy**: The process of duplicating the most recent Monthly_Budget to create a new Monthly_Budget for the next month when no budget exists for that month.
- **Budget_Summary**: An aggregated view showing total planned amount, total actual spending, and total variance for a given month across all categories.

## Requirements

### Requirement 1: Create a Monthly Budget

**User Story:** As a user, I want to create a budget for a specific month and year with per-category spending limits, so that I can plan my monthly expenses.

#### Acceptance Criteria

1. WHEN the user navigates to the Budget Planner page, THE Budget_Planner SHALL display a month/year selector defaulting to the current month and year.
2. WHEN the user selects a month and year, THE Budget_Planner SHALL display a list of all Categories from `getExpenseCategories()` with an input field for the planned amount for each Category.
3. WHEN the user enters a planned amount for a Category and saves the budget, THE Budget_Planner SHALL persist the Monthly_Budget with all Budget_Allocations to IndexedDB.
4. THE Budget_Planner SHALL validate that each planned amount is a non-negative numeric value before saving.
5. IF the user attempts to save a Monthly_Budget with an invalid planned amount, THEN THE Budget_Planner SHALL display an inline validation error message identifying the invalid field.
6. WHEN the user saves a Monthly_Budget, THE Budget_Planner SHALL display a success confirmation message.

### Requirement 2: Auto-Copy Budget to Next Month

**User Story:** As a user, I want my budget to automatically carry forward to the next month, so that I do not have to re-enter the same budget every month.

#### Acceptance Criteria

1. WHEN the user selects a month and year for which no Monthly_Budget exists, THE Budget_Planner SHALL check whether a Monthly_Budget exists for the most recent previous month.
2. WHEN a previous Monthly_Budget exists and no Monthly_Budget exists for the selected month, THE Budget_Planner SHALL pre-populate the budget form with all Budget_Allocations copied from the most recent previous Monthly_Budget.
3. WHEN no previous Monthly_Budget exists and no Monthly_Budget exists for the selected month, THE Budget_Planner SHALL display an empty budget form with all Categories and zero amounts.
4. THE Budget_Planner SHALL display a visual indicator (e.g., a banner or label) informing the user that the budget was auto-copied from a previous month.
5. WHEN the user modifies any pre-populated Budget_Allocation and saves, THE Budget_Planner SHALL persist the modified Monthly_Budget as a new record for the selected month without altering the source Monthly_Budget.

### Requirement 3: Edit an Existing Monthly Budget

**User Story:** As a user, I want to edit the budget for any month, so that I can adjust my spending plan as circumstances change.

#### Acceptance Criteria

1. WHEN the user selects a month and year for which a Monthly_Budget already exists, THE Budget_Planner SHALL load and display the existing Budget_Allocations in editable input fields.
2. WHEN the user modifies one or more Budget_Allocations and saves, THE Budget_Planner SHALL update the existing Monthly_Budget record in IndexedDB.
3. WHEN the user saves an edited Monthly_Budget, THE Budget_Planner SHALL display a success confirmation message.
4. THE Budget_Planner SHALL allow the user to add a Budget_Allocation for a Category that was previously set to zero or omitted.
5. THE Budget_Planner SHALL allow the user to set a Budget_Allocation to zero to indicate no planned spending for that Category.

### Requirement 4: Parse Transactions and Calculate Actual Spending

**User Story:** As a user, I want the system to automatically calculate my actual spending per category from my transaction logs, so that I can see how much I actually spent.

#### Acceptance Criteria

1. WHEN a Monthly_Budget is displayed for a selected month and year, THE Budget_Planner SHALL retrieve all Transaction_Logs where the transactionDate falls within the selected month and year.
2. THE Budget_Planner SHALL filter retrieved Transaction_Logs to include only debit transactions (where isCredit is false).
3. THE Budget_Planner SHALL group the filtered debit transactions by their category field.
4. THE Budget_Planner SHALL sum the amount values for each category group to compute the Actual_Spending per Category.
5. THE Budget_Planner SHALL parse the amount field from Transaction_Logs as a numeric value, handling comma-separated formats (e.g., "1,500.00") correctly.
6. IF no Transaction_Logs exist for the selected month and year, THEN THE Budget_Planner SHALL display zero as the Actual_Spending for all Categories.

### Requirement 5: Compare Planned Budget vs Actual Spending

**User Story:** As a user, I want to see a side-by-side comparison of my planned budget and actual spending for each category, so that I can understand where I overspent or underspent.

#### Acceptance Criteria

1. THE Budget_Planner SHALL display each Category with its planned Budget_Allocation amount, Actual_Spending amount, and Budget_Variance in a single row.
2. THE Budget_Planner SHALL calculate Budget_Variance as the planned amount minus the Actual_Spending for each Category.
3. WHEN the Budget_Variance for a Category is negative (overspent), THE Budget_Planner SHALL highlight that row with a red or warning color indicator.
4. WHEN the Budget_Variance for a Category is positive (underspent), THE Budget_Planner SHALL highlight that row with a green or success color indicator.
5. THE Budget_Planner SHALL display a Budget_Summary row at the bottom showing the total planned amount, total Actual_Spending, and total Budget_Variance across all Categories.
6. THE Budget_Planner SHALL display the percentage of budget consumed (Actual_Spending divided by planned amount multiplied by 100) for each Category that has a non-zero planned amount.

### Requirement 6: Category-Level Sorting and Filtering

**User Story:** As a user, I want to sort and filter the budget comparison by category, so that I can focus on specific spending areas.

#### Acceptance Criteria

1. THE Budget_Planner SHALL allow the user to sort the budget comparison table by Category name in ascending or descending alphabetical order.
2. THE Budget_Planner SHALL allow the user to sort the budget comparison table by planned amount, Actual_Spending, or Budget_Variance in ascending or descending numeric order.
3. THE Budget_Planner SHALL allow the user to filter the budget comparison to show only Categories where Actual_Spending exceeds the planned amount (overspent categories).
4. THE Budget_Planner SHALL allow the user to filter the budget comparison to show only Categories that have a non-zero planned amount or non-zero Actual_Spending.

### Requirement 7: Monthly Budget Comparison View

**User Story:** As a user, I want to view a summary of my planned vs actual spending across multiple months, so that I can track my budgeting trends over time.

#### Acceptance Criteria

1. THE Budget_Planner SHALL provide a monthly overview view that lists all months for which a Monthly_Budget exists.
2. THE Budget_Planner SHALL display for each month in the overview: the month/year label, total planned amount, total Actual_Spending, and total Budget_Variance.
3. THE Budget_Planner SHALL sort the monthly overview in reverse chronological order (most recent month first).
4. WHEN the user selects a month from the monthly overview, THE Budget_Planner SHALL navigate to the detailed category-level comparison view for that month.

### Requirement 8: Budget Data Persistence

**User Story:** As a user, I want my budget data to be stored locally, so that I can access my budgets without requiring a network connection.

#### Acceptance Criteria

1. THE Budget_Planner SHALL store all Monthly_Budget records in a dedicated IndexedDB object store named "monthly_budgets".
2. THE Budget_Planner SHALL use a composite key of month and year to uniquely identify each Monthly_Budget record.
3. WHEN the application initializes, THE Budget_Planner SHALL load the Monthly_Budget for the current month from IndexedDB if one exists.
4. IF IndexedDB is unavailable or an error occurs during read or write, THEN THE Budget_Planner SHALL display an error message to the user indicating that budget data could not be loaded or saved.

### Requirement 9: Budget Planner UI Layout

**User Story:** As a user, I want a clean and intuitive interface for the budget planner, so that I can easily manage and review my budgets.

#### Acceptance Criteria

1. THE Budget_Planner SHALL render within the existing application layout at the "/budget" route, replacing the current placeholder content.
2. THE Budget_Planner SHALL display the budget comparison in a tabular format with columns: Category (with icon and color from `getExpenseCategories()`), Planned Amount, Actual Spending, Variance, and Percentage Used.
3. THE Budget_Planner SHALL include a progress bar or visual indicator for each Category row showing the percentage of budget consumed.
4. THE Budget_Planner SHALL use MUI components consistent with the existing application design (Card, Table, Typography, TextField, Button).
5. THE Budget_Planner SHALL be responsive, displaying the table in a scrollable format on screens narrower than 768px.
6. THE Budget_Planner SHALL provide a toggle or tab to switch between the detailed category view and the monthly overview.
