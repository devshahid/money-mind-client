# Quick Start Guide - Expense Splitting

## 🎯 Your 3 Scenarios - Quick Solutions

### Scenario 1: Trip with Multiple Payers

**Your Problem:** Trip ₹30k total, you paid ₹20k, others paid ₹10k, 3 people

**Quick Steps:**

1. Select your ₹20k transactions
2. Click "Create Group"
3. Choose **"Custom Amounts"** from Split Type
4. Add 3 members:
   - You: Paid = ₹20,000
   - Friend A: Paid = ₹7,000
   - Friend B: Paid = ₹3,000
5. Click **"Calculate Shares"** button → Each gets ₹10,000
6. ✅ Done! You'll see:
   - Your net: **+₹10,000** (others owe you)
   - Friend A: **-₹3,000** (owes you)
   - Friend B: **-₹7,000** (owes you)

---

### Scenario 2: Movie Tickets (You Also Benefit)

**Your Problem:** Paid ₹3,000 for 10 people including yourself

**Quick Steps:**

1. Select the ₹3,000 transaction
2. Click "Create Group"
3. Choose **"Equal Split (Payer Included)"**
4. Add all 10 member names (including yourself)
5. Set your Paid = ₹3,000
6. Click **"Calculate Shares"** → Each person = ₹300
7. ✅ Done! Your net: **+₹2,700** (you get back)

---

### Scenario 3: Lending Money

**Your Problem:** Lent ₹10k, receiving back in parts

**Quick Steps:**

1. Select the ₹10,000 debit transaction
2. Click "Create Group"
3. Choose **"Loan/Lending"**
4. Add 2 members: You and Borrower
5. Set your Paid = ₹10,000
6. Click **"Calculate Shares"**
   - Your share: ₹0 (you're getting money back)
   - Borrower share: ₹10,000
7. ✅ Done! Your net: **+₹10,000** (owed to you)

**When they repay:**

- Edit the group
- Update borrower's "Paid" field (e.g., ₹2,000)
- Net automatically becomes **+₹8,000** (remaining)

---

## 💡 Pro Tips

### Tip 1: Use "Calculate Shares" Button

Don't manually calculate! Just:

1. Enter who paid what
2. Click "Calculate Shares"
3. System does the math

### Tip 2: Check Settlement Suggestions

The system shows you exactly who should pay whom:

- "Friend A → You: ₹3,000"
- "Friend B → You: ₹7,000"

### Tip 3: Net Balance Guide

- **Green (+)**: Others owe you money
- **Red (-)**: You owe others money
- **Yellow**: Partially settled

### Tip 4: Validate Your Entries

System warns you if:

- Total paid ≠ transaction total
- Missing member names
- Invalid amounts

---

## 🎨 Visual Guide

### Creating a Group

```
┌─────────────────────────────────┐
│ Create Group                    │
├─────────────────────────────────┤
│ Total Debits: ₹20,000          │
│ 3 transactions selected         │
├─────────────────────────────────┤
│ Group Name: [Trip to Goa]      │
├─────────────────────────────────┤
│ Split Type: [Custom Amounts ▼] │
│                                 │
│ ℹ️ Custom amounts assigned to   │
│    each member                  │
├─────────────────────────────────┤
│ Members    [Calculate Shares 🧮]│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Name: You                   ││
│ │ Paid: ₹20,000               ││
│ │ Share: ₹10,000 (auto)       ││
│ │ Net: ₹10,000 🟢 You owe them ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Name: Friend A              ││
│ │ Paid: ₹7,000                ││
│ │ Share: ₹10,000 (auto)       ││
│ │ Net: -₹3,000 🔴 They owe you ││
│ └─────────────────────────────┘│
│                                 │
│ [+ Add Member]                  │
├─────────────────────────────────┤
│ Total Paid: ₹30,000            │
│ Total Shares: ₹30,000          │
├─────────────────────────────────┤
│ Notes: [Optional]              │
├─────────────────────────────────┤
│     [Create Group]             │
└─────────────────────────────────┘
```

### Group Summary

```
┌─────────────────────────────────┐
│ Trip to Goa        [Edit] [Del] │
├─────────────────────────────────┤
│ Members: You, Friend A, Friend B│
│ 🏷️ Custom Amounts               │
├─────────────────────────────────┤
│ ℹ️ Settlement Suggestions:       │
│   Friend A → You: ₹3,000        │
│   Friend B → You: ₹7,000        │
├─────────────────────────────────┤
│ Settlement Breakdown            │
│                                 │
│ You                             │
│ Share: ₹10,000 | Paid: ₹20,000 │
│ ₹10,000 🟢 You owe them         │
│                                 │
│ Friend A                        │
│ Share: ₹10,000 | Paid: ₹7,000  │
│ ₹3,000 🔴 They owe you          │
│                                 │
│ Friend B                        │
│ Share: ₹10,000 | Paid: ₹3,000  │
│ ₹7,000 🔴 They owe you          │
├─────────────────────────────────┤
│ 🔴 Debits: ₹20,000             │
│ 🟢 Credits: ₹0                 │
│ 🟡 Status: Unsettled           │
└─────────────────────────────────┘
```

---

## 🆘 Common Questions

**Q: Do I need to add transactions from my friends?** A: No! Just enter what they paid in the "Paid" field manually.

**Q: What if the total doesn't match?** A: System will warn you. Double-check your amounts.

**Q: Can I edit a group later?** A: Yes! Click the Edit icon in the group summary.

**Q: How do I mark as settled?** A: When someone pays you back, add their payment as a credit transaction or update their "Paid" amount.

**Q: Which split type should I use?**

- **Multiple payers?** → Custom Amounts
- **You benefit?** → Equal Split (Payer Included)
- **Only for others?** → Equal Split (Payer Excluded)
- **Lending?** → Loan/Lending
- **Percentages?** → Percentage Split

---

## 🎁 Next Steps

1. ✅ Read this Quick Start
2. 📖 Check [EXPENSE_SPLIT_GUIDE.md](EXPENSE_SPLIT_GUIDE.md) for detailed examples
3. 🔧 See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

---

**Happy Splitting! 🎉**

No more manual calculations or spreadsheets. Let Money Mind handle the math!
