export function generateRepaymentSchedule(
  principal: number,
  interestRate: number,
  durationMonths: number,
  startDate: Date = new Date()
) {
  const schedule = [];
  const totalInterest = (principal * interestRate) / 100;
  const totalPayable = principal + totalInterest;
  const monthlyAmount = totalPayable / durationMonths;

  for (let i = 1; i <= durationMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      amount: monthlyAmount,
      dueDate: new Date(dueDate),
    });
  }

  return schedule;
}
