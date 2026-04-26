import fc from "fast-check";
import { calculateGroupBalance } from "../groupUtils";

// Generate valid positive amounts as strings (no NaN, no Infinity)
const amountArb = fc
    .float({
        min: Math.fround(0.01),
        max: Math.fround(100000),
        noNaN: true,
        noDefaultInfinity: true,
    })
    .map(String);

const transactionArb = fc.record({
    amount: amountArb,
    isCredit: fc.boolean(),
});

test("Property 13: Group balance calculation", () => {
    // Feature: money-mind-upgrade, Property 13: group balance = credits - debits
    fc.assert(
        fc.property(fc.array(transactionArb, { minLength: 2 }), (transactions) => {
            const balance = calculateGroupBalance(transactions as any);
            const expected = transactions.reduce((acc, tx) => {
                const amt = parseFloat(tx.amount);
                return tx.isCredit ? acc + amt : acc - amt;
            }, 0);
            return Math.abs(balance - expected) < 0.001;
        }),
        { numRuns: 100 },
    );
});

test("Property 13: isSettled — balance === 0 means settled", () => {
    // Feature: money-mind-upgrade, Property 13: group balance = credits - debits
    fc.assert(
        fc.property(fc.array(transactionArb, { minLength: 2 }), (transactions) => {
            const balance = calculateGroupBalance(transactions as any);
            const isSettled = balance === 0;
            const expectedSettled =
                transactions.reduce((acc, tx) => {
                    const amt = parseFloat(tx.amount);
                    return tx.isCredit ? acc + amt : acc - amt;
                }, 0) === 0;
            return isSettled === expectedSettled;
        }),
        { numRuns: 100 },
    );
});
