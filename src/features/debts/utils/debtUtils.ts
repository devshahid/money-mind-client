export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
}

export function calculateTotalInterest(principal: number, emi: number, tenureMonths: number): number {
  return emi * tenureMonths - principal
}

export function projectedPayoffDate(
  remainingBalance: number,
  monthlyEMI: number,
  annualRate: number,
  fromDate: Date
): Date {
  const r = annualRate / 12 / 100
  let balance = remainingBalance
  let months = 0

  while (balance > 0 && months < 600) {
    const interest = balance * r
    const principal = monthlyEMI - interest
    if (principal <= 0) break
    balance -= principal
    months++
  }

  const result = new Date(fromDate)
  result.setMonth(result.getMonth() + months)
  return result
}
