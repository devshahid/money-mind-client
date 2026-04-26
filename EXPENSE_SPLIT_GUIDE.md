# Expense Split System - User Guide

## Overview

The Money Mind expense split system now supports multiple split types to handle various real-world scenarios. This guide explains each split type and when to use them.

---

## Split Types

### 1. Equal Split (Payer Included) ✅ **DEFAULT**

**Use Case:** When the payer is also a beneficiary of the expense.

**Example: Movie Tickets**

- You paid ₹3,000 for movie tickets
- 10 people attended (including you)
- Each person's share: ₹300 (including you)
- You should receive back: ₹2,700 from the other 9 people

**How to Use:**

1. Select all debit transactions (your payment)
2. Create a group
3. Choose "Equal Split (Payer Included)"
4. Add all 10 members (including yourself)
5. Set your "Paid" amount to ₹3,000
6. Click "Calculate Shares" - each person gets ₹300
7. Result: Your net = ₹2,700 (others owe you)

---

### 2. Equal Split (Payer Excluded)

**Use Case:** When you paid for others but don't benefit from the expense yourself.

**Example: Buying Gifts for Others**

- You paid ₹2,000 for gifts for 4 friends
- You're not receiving a gift
- Each friend's share: ₹500
- You should receive back: ₹2,000

**How to Use:**

1. Select the debit transaction
2. Create a group with "Equal Split (Payer Excluded)"
3. Add yourself and the 4 friends (5 members total)
4. Set your "Paid" to ₹2,000
5. Click "Calculate Shares"
6. Your share will be ₹0, each friend gets ₹500
7. Result: Your net = ₹2,000 (all owed to you)

---

### 3. Custom Amounts ⭐ **RECOMMENDED FOR TRIP SCENARIO**

**Use Case:** When multiple people paid different amounts for a shared expense.

**Example: Trip with Multiple Payers (Your Scenario 1)**

- Total trip cost: ₹30,000
- You paid: ₹20,000 (transactions X + Y + Z)
- Friend A paid: ₹7,000
- Friend B paid: ₹3,000
- 3 people total
- Each person's fair share: ₹10,000

**How to Use:**

1. Select YOUR debit transactions (₹20,000 total)
2. Create a group with "Custom Amounts"
3. Add 3 members: You, Friend A, Friend B
4. Set Paid amounts:
    - You: ₹20,000
    - Friend A: ₹7,000
    - Friend B: ₹3,000
5. Manually set Share amounts (or click Calculate for equal):
    - You: ₹10,000
    - Friend A: ₹10,000
    - Friend B: ₹10,000
6. Result:
    - Your net: ₹20,000 - ₹10,000 = **₹10,000** (others owe you)
    - Friend A net: ₹7,000 - ₹10,000 = **-₹3,000** (they owe ₹3,000)
    - Friend B net: ₹3,000 - ₹10,000 = **-₹7,000** (they owe ₹7,000)

**Settlement Suggestions:**

- Friend A pays you ₹3,000
- Friend B pays you ₹7,000

**Important Notes:**

- If you only have YOUR transactions in the app, that's fine!
- Just manually enter what others paid in the "Paid" field
- The system will calculate who owes whom

---

### 4. Percentage Split

**Use Case:** When expenses should be split by custom percentages (e.g., based on income).

**Example: Rent Split by Income**

- Total rent: ₹30,000
- You (60% income): 50% share = ₹15,000
- Roommate (40% income): 50% share = ₹15,000

**How to Use:**

1. Select rent transaction
2. Choose "Percentage Split"
3. Add members and set percentages:
    - You: 50%
    - Roommate: 50%
4. Click "Calculate Shares"

---

### 5. Loan/Lending ⭐ **YOUR SCENARIO 3**

**Use Case:** Tracking money lent to someone, with partial repayments.

**Example: Lending ₹10,000 with Partial Repayments**

- You lent: ₹10,000
- Friend repaid so far: ₹4,000 (in 2 installments)
- Still owed: ₹6,000

**How to Use:**

**Step 1: Create the Loan**

1. Select the debit transaction (₹10,000 lent)
2. Create group with "Loan/Lending"
3. Add 2 members: You (lender) and Friend (borrower)
4. Set your "Paid" to ₹10,000
5. Click "Calculate Shares":
    - Your share: ₹0 (you're getting money back, not spending)
    - Friend's share: ₹10,000 (they need to repay)
6. Result: Your net = ₹10,000 (they owe you)

**Step 2: Track Repayments**

- When friend repays ₹2,000 (credit transaction), add it to the group
- Update friend's "Paid" to ₹2,000
- Net becomes: ₹10,000 - ₹2,000 = ₹8,000 still owed

**Alternative: Manual Update**

1. When friend pays back ₹2,000, edit the group
2. Update friend's "Paid" from ₹0 to ₹2,000
3. Net recalculates: ₹10,000 - ₹2,000 = ₹8,000 owed

---

### 6. Itemized Split

**Use Case:** Each person is responsible for specific transactions.

**Example: Grocery Shopping**

- Transaction 1 (₹500): Groceries for Person A
- Transaction 2 (₹800): Groceries for Person B
- Transaction 3 (₹600): Shared items

**How to Use:**

1. Select all transactions
2. Choose "Itemized Split"
3. Manually assign share amounts based on items

---

## Understanding the Fields

### Paid

- Amount the member actually paid out of pocket
- Can be ₹0 if they didn't pay anything yet

### Share

- Amount the member SHOULD pay (their fair portion)
- Auto-calculated for most split types

### Net

- Calculated as: **Paid - Share**
- **Positive net** (green): They paid more than their share → others owe them
- **Negative net** (red): They paid less than their share → they owe others
- **Zero net** (success): Fully settled

---

## Common Scenarios & Solutions

### Scenario 1: Trip with Mixed Payments ✅

**Problem:** Trip cost ₹30k, you paid ₹20k, others paid ₹10k, 3 people total.

**Solution:** Use "Custom Amounts"

- Add all 3 members
- Set each person's Paid amount (₹20k, ₹7k, ₹3k)
- Calculate shares (₹10k each)
- System shows who owes whom

---

### Scenario 2: Movie Tickets (Payer Benefits) ✅

**Problem:** You paid ₹3,000 for 10 people including yourself.

**Solution:** Use "Equal Split (Payer Included)"

- Add all 10 members including yourself
- Set your Paid to ₹3,000
- Calculate shares (₹300 each)
- Your net: ₹2,700 (others owe you)

---

### Scenario 3: Lending Money with Repayments ✅

**Problem:** Lent ₹10,000, receiving back in parts.

**Solution:** Use "Loan/Lending"

- Create group for the ₹10k debit
- Your share: ₹0, Friend's share: ₹10k
- Update friend's "Paid" as they repay
- Track remaining amount owed

---

## Settlement Suggestions

The system automatically generates optimal settlement suggestions:

**Example:**
If in a group:

- You: Net = +₹10,000
- Friend A: Net = -₹3,000
- Friend B: Net = -₹7,000

**Suggestions:**

1. Friend A pays you ₹3,000
2. Friend B pays you ₹7,000

This minimizes the number of transactions needed to settle the group.

---

## Tips & Best Practices

1. **Always verify "Total Paid" matches total debits**

    - The system warns you if they don't match

2. **Use Calculate Shares button**

    - Saves time and prevents calculation errors
    - Click after adding/updating members

3. **For complex trips**

    - Use "Custom Amounts"
    - Enter all payments upfront
    - Let the system calculate settlements

4. **For loans**

    - Use "Loan/Lending" type
    - Lender's share is always ₹0
    - Update "Paid" as repayments come in

5. **Credits vs Debits**

    - Debits (expenses) increase what others owe you
    - Credits (repayments) reduce what they owe

6. **Check settlement suggestions**
    - Shows the simplest way to settle up
    - Minimizes number of transactions

---

## FAQ

**Q: Can I mix different payment methods in one group?**
A: Yes! Just add all related transactions to the group.

**Q: What if someone paid outside the app?**
A: Manually enter their paid amount when creating the group.

**Q: How do I handle partial repayments?**
A: Use "Loan/Lending" type and update the "Paid" field as repayments are received.

**Q: Can I change split type after creating a group?**
A: Yes, edit the group and change the split type, then recalculate shares.

**Q: Why is my net negative?**
A: Negative net means you owe money. You paid less than your fair share.

---

## Summary: Which Split Type to Use?

| Scenario                             | Split Type                   | Why                                       |
| ------------------------------------ | ---------------------------- | ----------------------------------------- |
| Movie tickets, dinners (you benefit) | Equal Split (Payer Included) | You're part of the group benefiting       |
| Buying for others only               | Equal Split (Payer Excluded) | You don't benefit from expense            |
| Trip with multiple payers            | Custom Amounts               | Different people paid different amounts   |
| Income-based splits                  | Percentage Split             | Fair based on earning capacity            |
| Lending money                        | Loan/Lending                 | Not a split, just tracking loan           |
| Specific item assignments            | Itemized                     | Each person responsible for certain items |

---

Need help? Check the examples in each split type description above!
