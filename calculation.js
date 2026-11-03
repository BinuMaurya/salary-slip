function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, 
  year = new Date().getFullYear(),   
  customDaysWorked = null,          
  otHours = 0, 
  customOtRate = null,
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Base Rate (Decimal/Paise hatane ke liye Math.floor ka use)
  const rawPerDayRate = monthlySalary / 28;
  const perDayRate = Math.floor(rawPerDayRate); // Jaise 643.57 -> 643 (ya jo bhi aaye)

  // 2. OT Rate Calculation (Decimal/Paise hatane ke liye Math.floor ka use)
  const calculatedOtRate = perDayRate / 8;
  const otRatePerHour = (customOtRate !== null && customOtRate !== undefined && customOtRate !== '' && Number(customOtRate) > 0) 
    ? Number(customOtRate) 
    : Math.floor(calculatedOtRate); // Jaise 72.5 -> 72

  // 3. Days Worked
  const daysWorked = customDaysWorked !== null ? Number(customDaysWorked) : 28;
  const payableDays = daysWorked; 

  // 4. Base Earned Salary Calculation
  const baseEarnedSalaryExact = (daysWorked === 28) 
    ? Number(monthlySalary) 
    : (perDayRate * payableDays);

  // 5. OT Amount Calculation
  const otAmountExact = otRatePerHour * Number(otHours);
  const otAmount = Math.floor(otAmountExact);

  // 6. Final Breakdown
  const baseEarnedSalary = Math.round(baseEarnedSalaryExact);
  const grossSalary = baseEarnedSalary + otAmount;
  
  const totalDeductions = Math.round(Number(weeklyWages) + Number(pf) + Number(advance));
  const netSalary = grossSalary - totalDeductions;

  return {
    selectedMonth: month,
    selectedYear: year,
    daysInMonth,
    daysWorked,
    payableDays,
    perDayRate,
    otRatePerHour,
    baseEarnedSalary,
    otAmount,
    grossSalary,
    weeklyWages: Number(weeklyWages),
    pf: Number(pf),
    advance: Number(advance),
    totalDeductions,
    netSalary
  };
}

// Universal Export Support
export { calculateSalarySlip };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateSalarySlip };
}