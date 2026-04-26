import fc from 'fast-check'
import { aggregateMonthlyIncomeExpense, aggregateCategoryBreakdown, aggregateNetSavingsTrend } from '../analyticsUtils'
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

/** A category string (non-empty) */
const categoryArb = fc.constantFrom('Food', 'Fuel', 'Travel', 'Shopping', 'Bills', 'EMI', 'Other')

/** Bank name arbitrary */
const bankNameArb = fc.constantFrom('BankA', 'BankB', 'BankC')

/**
 * Build a transaction date string for a given month/year.
 * Day is fixed to 15 to avoid month-boundary issues.
 */
function makeDateStr(month: number, year: number): string {
  const mm = String(month).padStart(2, '0')
  return `${year}-${mm}-15T00:00:00.000Z`
}

/** Generate a minimal ITransaction */
const transactionArb = fc.record<ITransaction>({
  _id: fc.uuid(),
  transactionDate: fc
    .integer({ min: 2020, max: 2024 })
    .chain(year => fc.integer({ min: 1, max: 12 }).map(month => makeDateStr(month, year))),
  narration: fc.string({ minLength: 1, maxLength: 20 }),
  notes: fc.constant(''),
  category: categoryArb,
  label: fc.constant([]),
  amount: amountArb,
  bankName: bankNameArb,
  isCredit: fc.boolean(),
  isCash: fc.constant(false),
})

// ---------------------------------------------------------------------------
// Property 24: Analytics mathematical invariants
// ---------------------------------------------------------------------------

test('Property 24: Net savings equals credits minus debits for each month', () => {
  // Feature: money-mind-upgrade, Property 24: Analytics mathematical invariants
  fc.assert(
    fc.property(fc.array(transactionArb, { minLength: 1, maxLength: 30 }), transactions => {
      const trend = aggregateNetSavingsTrend(transactions)
      const monthly = aggregateMonthlyIncomeExpense(transactions)

      // For every month in the trend, netSavings must equal income - expense
      return trend.every(({ month, netSavings }) => {
        const entry = monthly.find(m => m.month === month)
        if (!entry) return false
        const expected = entry.income - entry.expense
        return Math.abs(netSavings - expected) < 0.001
      })
    }),
    { numRuns: 100 }
  )
})

test('Property 24: Category breakdown values sum to total debit amount for the period', () => {
  // Feature: money-mind-upgrade, Property 24: Analytics mathematical invariants
  fc.assert(
    fc.property(fc.array(transactionArb, { minLength: 0, maxLength: 30 }), transactions => {
      const breakdown = aggregateCategoryBreakdown(transactions)

      // Sum of all category amounts must equal sum of all debit amounts
      const totalFromBreakdown = breakdown.reduce((sum, { amount }) => sum + amount, 0)
      const totalDebits = transactions
        .filter(tx => !tx.isCredit)
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

      return Math.abs(totalFromBreakdown - totalDebits) < 0.001
    }),
    { numRuns: 100 }
  )
})

test('Property 24: Monthly income aggregation only includes credit transactions', () => {
  // Feature: money-mind-upgrade, Property 24: Analytics mathematical invariants
  fc.assert(
    fc.property(
      fc.integer({ min: 2020, max: 2024 }),
      fc.integer({ min: 1, max: 12 }),
      fc.array(amountArb, { minLength: 1, maxLength: 10 }),
      fc.array(amountArb, { minLength: 1, maxLength: 10 }),
      (year, month, creditAmounts, debitAmounts) => {
        const dateStr = makeDateStr(month, year)
        const monthKey = `${year}-${String(month).padStart(2, '0')}`

        const credits: ITransaction[] = creditAmounts.map((amount, i) => ({
          _id: `c-${i}`,
          transactionDate: dateStr,
          narration: 'credit',
          notes: '',
          category: 'Income',
          label: [],
          amount,
          bankName: 'BankA',
          isCredit: true,
          isCash: false,
        }))

        const debits: ITransaction[] = debitAmounts.map((amount, i) => ({
          _id: `d-${i}`,
          transactionDate: dateStr,
          narration: 'debit',
          notes: '',
          category: 'Food',
          label: [],
          amount,
          bankName: 'BankA',
          isCredit: false,
          isCash: false,
        }))

        const result = aggregateMonthlyIncomeExpense([...credits, ...debits])
        const entry = result.find(r => r.month === monthKey)
        if (!entry) return false

        const expectedIncome = credits.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
        const expectedExpense = debits.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

        return Math.abs(entry.income - expectedIncome) < 0.001 && Math.abs(entry.expense - expectedExpense) < 0.001
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 25: Analytics filter correctness
// ---------------------------------------------------------------------------

test('Property 25: Date range filter — no out-of-range transactions contribute to category breakdown', () => {
  // Feature: money-mind-upgrade, Property 25: Analytics filter correctness
  fc.assert(
    fc.property(
      // Generate a fixed date range: year 2022, months 3–6
      fc
        .integer({ min: 2020, max: 2023 })
        .chain(year =>
          fc
            .integer({ min: 1, max: 11 })
            .chain(startMonth =>
              fc.integer({ min: startMonth + 1, max: 12 }).map(endMonth => ({ year, startMonth, endMonth }))
            )
        ),
      // Transactions strictly outside the range
      fc.array(
        fc.record<ITransaction>({
          _id: fc.uuid(),
          transactionDate: fc.constant('2019-01-15T00:00:00.000Z'),
          narration: fc.string({ minLength: 1, maxLength: 10 }),
          notes: fc.constant(''),
          category: categoryArb,
          label: fc.constant([]),
          amount: amountArb,
          bankName: fc.constant('BankA'),
          isCredit: fc.constant(false),
          isCash: fc.constant(false),
        }),
        { minLength: 1, maxLength: 10 }
      ),
      ({ year, startMonth, endMonth }, outOfRangeTransactions) => {
        const dateFrom = `${year}-${String(startMonth).padStart(2, '0')}-01`
        const dateTo = `${year}-${String(endMonth).padStart(2, '0')}-28`

        const breakdown = aggregateCategoryBreakdown(outOfRangeTransactions, {
          dateFrom,
          dateTo,
        })

        // All out-of-range transactions should contribute nothing
        const total = breakdown.reduce((sum, { amount }) => sum + amount, 0)
        return total === 0
      }
    ),
    { numRuns: 100 }
  )
})

test('Property 25: Bank name filter — only transactions from the selected bank contribute', () => {
  // Feature: money-mind-upgrade, Property 25: Analytics filter correctness
  fc.assert(
    fc.property(
      // Two distinct bank names
      fc.constantFrom(['BankA', 'BankB'], ['BankA', 'BankC'], ['BankB', 'BankC']) as fc.Arbitrary<[string, string]>,
      // Transactions for bank A
      fc.array(amountArb, { minLength: 1, maxLength: 10 }),
      // Transactions for bank B
      fc.array(amountArb, { minLength: 1, maxLength: 10 }),
      ([bankA, bankB], amountsA, amountsB) => {
        const dateStr = '2023-06-15T00:00:00.000Z'

        const txsA: ITransaction[] = amountsA.map((amount, i) => ({
          _id: `a-${i}`,
          transactionDate: dateStr,
          narration: 'tx',
          notes: '',
          category: 'Food',
          label: [],
          amount,
          bankName: bankA,
          isCredit: false,
          isCash: false,
        }))

        const txsB: ITransaction[] = amountsB.map((amount, i) => ({
          _id: `b-${i}`,
          transactionDate: dateStr,
          narration: 'tx',
          notes: '',
          category: 'Food',
          label: [],
          amount,
          bankName: bankB,
          isCredit: false,
          isCash: false,
        }))

        const allTransactions = [...txsA, ...txsB]

        // Filter by bankA — result should only include bankA amounts
        const breakdownA = aggregateCategoryBreakdown(allTransactions, {
          bankName: bankA,
        })
        const totalA = breakdownA.reduce((sum, { amount }) => sum + amount, 0)
        const expectedA = txsA.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

        // Filter by bankB — result should only include bankB amounts
        const breakdownB = aggregateCategoryBreakdown(allTransactions, {
          bankName: bankB,
        })
        const totalB = breakdownB.reduce((sum, { amount }) => sum + amount, 0)
        const expectedB = txsB.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

        return Math.abs(totalA - expectedA) < 0.001 && Math.abs(totalB - expectedB) < 0.001
      }
    ),
    { numRuns: 100 }
  )
})

test('Property 25: Combined date range and bank filter — only matching transactions contribute', () => {
  // Feature: money-mind-upgrade, Property 25: Analytics filter correctness
  fc.assert(
    fc.property(
      // In-range transactions for the target bank
      fc.array(amountArb, { minLength: 0, maxLength: 10 }),
      // Out-of-range transactions for the target bank
      fc.array(amountArb, { minLength: 0, maxLength: 5 }),
      // In-range transactions for a different bank
      fc.array(amountArb, { minLength: 0, maxLength: 5 }),
      (inRangeAmounts, outOfRangeAmounts, otherBankAmounts) => {
        const targetBank = 'BankA'
        const otherBank = 'BankB'
        const dateFrom = '2023-03-01'
        const dateTo = '2023-06-30'
        const inRangeDate = '2023-05-15T00:00:00.000Z'
        const outOfRangeDate = '2022-01-15T00:00:00.000Z'

        const inRangeTxs: ITransaction[] = inRangeAmounts.map((amount, i) => ({
          _id: `in-${i}`,
          transactionDate: inRangeDate,
          narration: 'tx',
          notes: '',
          category: 'Food',
          label: [],
          amount,
          bankName: targetBank,
          isCredit: false,
          isCash: false,
        }))

        const outOfRangeTxs: ITransaction[] = outOfRangeAmounts.map((amount, i) => ({
          _id: `out-${i}`,
          transactionDate: outOfRangeDate,
          narration: 'tx',
          notes: '',
          category: 'Food',
          label: [],
          amount,
          bankName: targetBank,
          isCredit: false,
          isCash: false,
        }))

        const otherBankTxs: ITransaction[] = otherBankAmounts.map((amount, i) => ({
          _id: `other-${i}`,
          transactionDate: inRangeDate,
          narration: 'tx',
          notes: '',
          category: 'Food',
          label: [],
          amount,
          bankName: otherBank,
          isCredit: false,
          isCash: false,
        }))

        const allTransactions = [...inRangeTxs, ...outOfRangeTxs, ...otherBankTxs]

        const breakdown = aggregateCategoryBreakdown(allTransactions, {
          dateFrom,
          dateTo,
          bankName: targetBank,
        })

        const total = breakdown.reduce((sum, { amount }) => sum + amount, 0)
        const expected = inRangeTxs.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

        return Math.abs(total - expected) < 0.001
      }
    ),
    { numRuns: 100 }
  )
})
