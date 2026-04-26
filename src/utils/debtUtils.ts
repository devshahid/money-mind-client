/**
 * Debt utility functions for EMI calculation, interest computation,
 * and projected payoff date estimation.
 */

/**
 * Calculates the monthly EMI using the reducing balance method.
 * @param principal - Loan principal amount
 * @param annualRate - Annual interest rate as a percentage (e.g. 12 for 12%)
 * @param tenureMonths - Loan tenure in months
 * @returns Monthly EMI amount
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (annualRate === 0) return principal / tenureMonths;
    const r = annualRate / 12 / 100;
    return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

/**
 * Calculates the total interest payable over the loan tenure.
 * @param principal - Loan principal amount
 * @param emi - Monthly EMI amount
 * @param tenureMonths - Loan tenure in months
 * @returns Total interest payable
 */
export function calculateTotalInterest(principal: number, emi: number, tenureMonths: number): number {
    return emi * tenureMonths - principal;
}

/**
 * Projects the payoff date by simulating monthly payments.
 * Stops early if EMI is too low to cover interest (balance would grow).
 * @param remainingBalance - Current remaining loan balance
 * @param monthlyEMI - Monthly EMI or payment amount
 * @param annualRate - Annual interest rate as a percentage
 * @param fromDate - Starting date for the projection
 * @returns Projected date when the loan will be fully paid off
 */
export function projectedPayoffDate(remainingBalance: number, monthlyEMI: number, annualRate: number, fromDate: Date): Date {
    const r = annualRate / 12 / 100;
    let balance = remainingBalance;
    let months = 0;

    while (balance > 0 && months < 600) {
        // 600 months = 50yr safety cap
        const interest = balance * r;
        const principal = monthlyEMI - interest;
        if (principal <= 0) break; // EMI too low to cover interest
        balance -= principal;
        months++;
    }

    const result = new Date(fromDate);
    result.setMonth(result.getMonth() + months);
    return result;
}
