export function calculateRepayment(principal: number, interestRate: number, durationMonths: number) {
  const totalInterest = (principal * interestRate) / 100;
  const totalPayable = principal + totalInterest;
  const monthlyRepayment = totalPayable / durationMonths;

  return {
    principal,
    totalInterest,
    totalPayable,
    monthlyRepayment,
  };
}

export function generateRepaymentSchedule(principal: number, interestRate: number, durationMonths: number, startDate: Date) {
  const { monthlyRepayment } = calculateRepayment(principal, interestRate, durationMonths);
  const schedule = [];

  for (let i = 1; i <= durationMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      installment: i,
      amount: monthlyRepayment,
      dueDate,
    });
  }

  return schedule;
}
