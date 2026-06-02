import fc from 'fast-check'
import { calculateSpentForBudget, getBudgetStatus } from '../budgetUtils'
import { ITransaction } from '../../types/transaction'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Valid positive amount as string */
const amountArb = fc
  .float({
    min: Math.fround(0.01),
    max: Math.fround(100000),
    noNaN: true,
    noDefaultInfinity: true,
  })
  .map(String)

/** Month: 1–12 */
const monthArb = fc.integer({ min: 1, max: 12 })

/** Year: 2000–2030 */
const yearArb = fc.integer({ min: 2000, max: 2030 })

/** A category string (non-empty) */
const categoryArb = fc.constantFrom('Food', 'Fuel', 'Travel', 'Shopping', 'Bills', 'EMI', 'Other')

/**
 * Build a transaction date string for a given month/year.
 * Day is fixed to 15 to avoid month-boundary issues.
 */
function makeDateStr(month: number, year: number): string {
  const mm = String(month).padStart(2, '0')
  return `${year}-${mm}-15T00:00:00.000Z`
}

/** Generate a transaction for a specific category, month, year, and isCredit flag */
const makeTransactionArb = (
  category: string,
  month: number,
  year: number,
  isCredit: boolean
): fc.Arbitrary<ITransaction> =>
  fc.record({
    _id: fc.uuid(),
    transactionDate: fc.constant(makeDateStr(month, year)),
    narration: fc.string({ minLength: 1, maxLength: 20 }),
    notes: fc.constant(''),
    category: fc.constant(category),
    label: fc.constant([]),
    amount: amountArb,
    bankName: fc.constant('TestBank'),
    isCredit: fc.constant(isCredit),
    isCash: fc.constant(false),
  })

// ---------------------------------------------------------------------------
// Property 22: Budget spend calculation
// ---------------------------------------------------------------------------

test('Property 22: Budget spend calculation — matches manual sum of matching debits', () => {
  // Feature: money-mind-upgrade, Property 22: Budget spend calculation
  fc.assert(
    fc.property(
      categoryArb,
      monthArb,
      yearArb,
      // matching debit transactions (same category, month, year)
      fc.integer({ min: 0, max: 10 }).chain(n =>
        fc.tuple(
          fc.constant(n),
          n === 0
            ? fc.constant([] as ITransaction[])
            : fc.array(
                fc.record({
                  _id: fc.uuid(),
                  transactionDate: fc.constant(''),
                  narration: fc.string({ minLength: 1, maxLength: 20 }),
                  notes: fc.constant(''),
                  category: fc.constant(''),
                  label: fc.constant([]),
                  amount: amountArb,
                  bankName: fc.constant('TestBank'),
                  isCredit: fc.constant(false),
                  isCash: fc.constant(false),
                }),
                { minLength: n, maxLength: n }
              )
        )
      ),
      // noise transactions (wrong category, wrong month, or credit)
      fc.array(
        fc.oneof(
          // wrong category debit
          fc.record({
            _id: fc.uuid(),
            transactionDate: fc.constant(''),
            narration: fc.string({ minLength: 1, maxLength: 20 }),
            notes: fc.constant(''),
            category: fc.constant('__OTHER__'),
            label: fc.constant([]),
            amount: amountArb,
            bankName: fc.constant('TestBank'),
            isCredit: fc.constant(false),
            isCash: fc.constant(false),
          }),
          // credit with matching category
          fc.record({
            _id: fc.uuid(),
            transactionDate: fc.constant(''),
            narration: fc.string({ minLength: 1, maxLength: 20 }),
            notes: fc.constant(''),
            category: fc.constant(''),
            label: fc.constant([]),
            amount: amountArb,
            bankName: fc.constant('TestBank'),
            isCredit: fc.constant(true),
            isCash: fc.constant(false),
          })
        ),
        { minLength: 0, maxLength: 10 }
      ),
      (category, month, year, [, matchingDebits], noiseTransactions) => {
        // Fix up matching debits with correct category and date
        const fixedMatchingDebits: ITransaction[] = matchingDebits.map(tx => ({
          ...tx,
          category,
          transactionDate: makeDateStr(month, year),
        }))

        // Fix up noise: wrong category gets a different month or wrong category
        const fixedNoise: ITransaction[] = noiseTransactions.map(tx => ({
          ...tx,
          category: tx.isCredit ? category : '__OTHER__',
          transactionDate: makeDateStr(month, year),
        }))

        const allTransactions = [...fixedMatchingDebits, ...fixedNoise]

        const result = calculateSpentForBudget(allTransactions, category, month, year)

        const expected = fixedMatchingDebits.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

        return Math.abs(result - expected) < 0.001
      }
    ),
    { numRuns: 100 }
  )
})

test('Property 22: Budget spend calculation — transactions from different months are excluded', () => {
  // Feature: money-mind-upgrade, Property 22: Budget spend calculation
  fc.assert(
    fc.property(
      categoryArb,
      monthArb,
      yearArb,
      fc.array(amountArb, { minLength: 1, maxLength: 10 }),
      (category, month, year, amounts) => {
        // Use a different month (wrap around)
        const otherMonth = month === 12 ? 1 : month + 1
        const otherYear = month === 12 ? year + 1 : year

        const transactions: ITransaction[] = amounts.map((amount, i) => ({
          _id: `tx-${i}`,
          transactionDate: makeDateStr(otherMonth, otherYear),
          narration: 'test',
          notes: '',
          category,
          label: [],
          amount,
          bankName: 'TestBank',
          isCredit: false,
          isCash: false,
        }))

        const result = calculateSpentForBudget(transactions, category, month, year)
        return result === 0
      }
    ),
    { numRuns: 100 }
  )
})

test('Property 22: Budget spend calculation — credit transactions are excluded', () => {
  // Feature: money-mind-upgrade, Property 22: Budget spend calculation
  fc.assert(
    fc.property(
      categoryArb,
      monthArb,
      yearArb,
      fc.array(amountArb, { minLength: 1, maxLength: 10 }),
      (category, month, year, amounts) => {
        const transactions: ITransaction[] = amounts.map((amount, i) => ({
          _id: `tx-${i}`,
          transactionDate: makeDateStr(month, year),
          narration: 'test',
          notes: '',
          category,
          label: [],
          amount,
          bankName: 'TestBank',
          isCredit: true, // all credits — should be excluded
          isCash: false,
        }))

        const result = calculateSpentForBudget(transactions, category, month, year)
        return result === 0
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 23: Budget threshold indicators
// ---------------------------------------------------------------------------

/** Positive limit amount */
const limitArb = fc.float({
  min: Math.fround(1),
  max: Math.fround(100000),
  noNaN: true,
  noDefaultInfinity: true,
})

test('Property 23: Budget threshold — over-budget when spentAmount > limitAmount', () => {
  // Feature: money-mind-upgrade, Property 23: Budget threshold indicators
  fc.assert(
    fc.property(
      limitArb,
      // spent is strictly greater than limit
      limitArb.chain(limit =>
        fc
          .float({
            min: Math.fround(limit + 0.01),
            max: Math.fround(limit * 2 + 1),
            noNaN: true,
            noDefaultInfinity: true,
          })
          .map(extra => ({ limit, spent: limit + extra }))
      ),
      (_, { limit, spent }) => {
        const { isOverBudget, isWarning } = getBudgetStatus(spent, limit)
        return isOverBudget === true && isWarning === false
      }
    ),
    { numRuns: 100 }
  )
})

test('Property 23: Budget threshold — warning when spentAmount / limitAmount >= 0.8 and not over-budget', () => {
  // Feature: money-mind-upgrade, Property 23: Budget threshold indicators
  fc.assert(
    fc.property(
      limitArb,
      // ratio in [0.8, 1.0] — at or above warning threshold but not over budget
      fc.float({ min: Math.fround(0.8), max: Math.fround(1.0), noNaN: true, noDefaultInfinity: true }),
      (limit, ratio) => {
        const spent = limit * ratio
        // Exclude the exact over-budget case (spent > limit)
        if (spent > limit) return true // skip edge
        const { isWarning, isOverBudget } = getBudgetStatus(spent, limit)
        return isWarning === true && isOverBudget === false
      }
    ),
    { numRuns: 100 }
  )
})

test('Property 23: Budget threshold — no indicator when spentAmount / limitAmount < 0.8', () => {
  // Feature: money-mind-upgrade, Property 23: Budget threshold indicators
  fc.assert(
    fc.property(
      limitArb,
      // ratio strictly below 0.8
      fc.float({ min: Math.fround(0), max: Math.fround(0.799), noNaN: true, noDefaultInfinity: true }),
      (limit, ratio) => {
        const spent = limit * ratio
        const { isWarning, isOverBudget } = getBudgetStatus(spent, limit)
        return isWarning === false && isOverBudget === false
      }
    ),
    { numRuns: 100 }
  )
})
