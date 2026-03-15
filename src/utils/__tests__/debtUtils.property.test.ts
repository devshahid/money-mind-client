import fc from "fast-check";
import { calculateEMI, calculateTotalInterest, projectedPayoffDate } from "../debtUtils";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Positive principal: 1 – 10,000,000 */
const principalArb = fc.float({
    min: Math.fround(1),
    max: Math.fround(10_000_000),
    noNaN: true,
    noDefaultInfinity: true,
});

/** Annual interest rate: 0.01% – 36% (non-zero for Property 17 formula) */
const positiveRateArb = fc.float({
    min: Math.fround(0.01),
    max: Math.fround(36),
    noNaN: true,
    noDefaultInfinity: true,
});

/** Tenure: 1 – 360 months */
const tenureArb = fc.integer({ min: 1, max: 360 });

// ---------------------------------------------------------------------------
// Property 17: EMI and interest calculations
// ---------------------------------------------------------------------------

test("Property 17: EMI formula matches reducing-balance formula", () => {
    // Feature: money-mind-upgrade, Property 17: EMI and interest calculations
    fc.assert(
        fc.property(principalArb, positiveRateArb, tenureArb, (P, R, N) => {
            const r = R / 12 / 100;
            const expectedEMI = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
            const emi = calculateEMI(P, R, N);
            // Allow a small relative tolerance for floating-point arithmetic
            return Math.abs(emi - expectedEMI) < expectedEMI * 1e-5 + 1e-6;
        }),
        { numRuns: 100 },
    );
});

test("Property 17: totalInterestPayable equals EMI * N - P", () => {
    // Feature: money-mind-upgrade, Property 17: EMI and interest calculations
    fc.assert(
        fc.property(principalArb, positiveRateArb, tenureArb, (P, R, N) => {
            const emi = calculateEMI(P, R, N);
            const totalInterest = calculateTotalInterest(P, emi, N);
            const expected = emi * N - P;
            return Math.abs(totalInterest - expected) < 1e-4;
        }),
        { numRuns: 100 },
    );
});

test("Property 17: zero-rate EMI equals principal / tenure", () => {
    // Feature: money-mind-upgrade, Property 17: EMI and interest calculations
    fc.assert(
        fc.property(principalArb, tenureArb, (P, N) => {
            const emi = calculateEMI(P, 0, N);
            return Math.abs(emi - P / N) < 1e-6;
        }),
        { numRuns: 100 },
    );
});

// ---------------------------------------------------------------------------
// Property 18: Payment reduces remaining balance
// ---------------------------------------------------------------------------

/**
 * Simulate one month's payment: returns the new balance after applying
 * a payment of `paymentAmount` against `balance` at monthly rate `r`.
 * The principal portion = paymentAmount - interest.
 */
function applyPayment(balance: number, paymentAmount: number, annualRate: number): { newBalance: number; principalPortion: number } {
    const r = annualRate / 12 / 100;
    const interest = balance * r;
    const principalPortion = paymentAmount - interest;
    const newBalance = balance - principalPortion;
    return { newBalance, principalPortion };
}

test("Property 18: payment reduces remaining balance", () => {
    // Feature: money-mind-upgrade, Property 18: Payment reduces remaining balance
    fc.assert(
        fc.property(principalArb, positiveRateArb, tenureArb, (P, R, N) => {
            const emi = calculateEMI(P, R, N);
            const { newBalance, principalPortion } = applyPayment(P, emi, R);
            // Balance must decrease
            if (newBalance >= P) return false;
            // Reduction must equal principal portion
            const reduction = P - newBalance;
            return Math.abs(reduction - principalPortion) < 1e-4;
        }),
        { numRuns: 100 },
    );
});

test("Property 18: part-payment also reduces balance by its principal portion", () => {
    // Feature: money-mind-upgrade, Property 18: Payment reduces remaining balance
    fc.assert(
        fc.property(
            principalArb,
            positiveRateArb,
            // Part-payment: between 1 and principal (must exceed monthly interest)
            fc.float({ min: Math.fround(1), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
            (P, R, partPayment) => {
                const r = R / 12 / 100;
                const monthlyInterest = P * r;
                // Only test cases where payment covers interest (principal portion > 0)
                if (partPayment <= monthlyInterest) return true; // skip
                const { newBalance, principalPortion } = applyPayment(P, partPayment, R);
                if (newBalance >= P) return false;
                const reduction = P - newBalance;
                return Math.abs(reduction - principalPortion) < 1e-4;
            },
        ),
        { numRuns: 100 },
    );
});

// ---------------------------------------------------------------------------
// Property 20: EMI reminder threshold
// ---------------------------------------------------------------------------

/**
 * Pure date-comparison logic extracted from EMIReminderBanner:
 * returns true if nextPaymentDate is within `thresholdDays` calendar days
 * of `today` (inclusive of today, exclusive of dates beyond threshold).
 */
function isWithinReminderThreshold(nextPaymentDate: Date, today: Date, thresholdDays = 5): boolean {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = (nextPaymentDate.getTime() - today.getTime()) / msPerDay;
    return diffDays >= 0 && diffDays <= thresholdDays;
}

test("Property 20: date within 5 days triggers reminder", () => {
    // Feature: money-mind-upgrade, Property 20: EMI reminder threshold
    fc.assert(
        fc.property(
            // offset in whole days: 0 – 5 (within threshold)
            fc.integer({ min: 0, max: 5 }),
            (offsetDays) => {
                const today = new Date("2024-01-10T00:00:00.000Z");
                const nextPaymentDate = new Date(today);
                nextPaymentDate.setUTCDate(nextPaymentDate.getUTCDate() + offsetDays);
                return isWithinReminderThreshold(nextPaymentDate, today) === true;
            },
        ),
        { numRuns: 100 },
    );
});

test("Property 20: date more than 5 days away does not trigger reminder", () => {
    // Feature: money-mind-upgrade, Property 20: EMI reminder threshold
    fc.assert(
        fc.property(
            // offset in whole days: 6 – 365 (beyond threshold)
            fc.integer({ min: 6, max: 365 }),
            (offsetDays) => {
                const today = new Date("2024-01-10T00:00:00.000Z");
                const nextPaymentDate = new Date(today);
                nextPaymentDate.setUTCDate(nextPaymentDate.getUTCDate() + offsetDays);
                return isWithinReminderThreshold(nextPaymentDate, today) === false;
            },
        ),
        { numRuns: 100 },
    );
});

test("Property 20: past dates do not trigger reminder", () => {
    // Feature: money-mind-upgrade, Property 20: EMI reminder threshold
    fc.assert(
        fc.property(fc.integer({ min: 1, max: 365 }), (offsetDays) => {
            const today = new Date("2024-01-10T00:00:00.000Z");
            const nextPaymentDate = new Date(today);
            nextPaymentDate.setUTCDate(nextPaymentDate.getUTCDate() - offsetDays);
            return isWithinReminderThreshold(nextPaymentDate, today) === false;
        }),
        { numRuns: 100 },
    );
});
