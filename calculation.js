function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, 
  year = new Date().getFullYear(),   
  isFullAttendance = true,           
  customDaysWorked = null,           
  otHours = 0, 
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Per day rate based on 28 days base
  const exactPerDayRate = monthlySalary / 28;
  const exactOtRatePerHour = exactPerDayRate / 8;

  let daysWorked = customDaysWorked !== null ? customDaysWorked : 28;
  let payableDays = daysWorked;

  // 2. Base Earned Salary Calculation logic
  let baseEarnedSalary;

  if (isFullAttendance && daysWorked >= 28) {
    // Exact monthly salary without any decimal math error
    baseEarnedSalary = monthlySalary; 
  } else {
    // Strict Math.floor so no extra rupee is added ever
    baseEarnedSalary = Math.floor(exactPerDayRate * payableDays);
  }

  // 3. Exact OT Calculation (Floored to avoid extra rupee)
  const otAmount = Math.floor(exactOtRatePerHour * otHours);

  // 4. Final Math
  const grossSalary = baseEarnedSalary + otAmount;
  const totalDeductions = Math.floor(weeklyWages + pf + advance);
  const netSalary = grossSalary - totalDeductions;

  return {
    selectedMonth: month,
    selectedYear: year,
    daysInMonth,
    daysWorked,
    payableDays,
    perDayRate: Number(exactPerDayRate.toFixed(2)),
    otRatePerHour: Number(exactOtRatePerHour.toFixed(2)),
    baseEarnedSalary,
    otAmount,
    grossSalary,
    weeklyWages,
    pf,
    advance,
    totalDeductions,
    netSalary
  };
}

module.exports = { calculateSalarySlip };