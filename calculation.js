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

  // 1. Calculate Base Rates
  const rawPerDayRate = monthlySalary / 28;
  
  // FIXED: Calculator ki tarah Per Day Rate ko 2 decimals par FIX kar rahe hain
  // e.g. 17000 / 28 = 607.1428 -> 607.14
  const perDayRate = Number(rawPerDayRate.toFixed(2));

  // OT Rate Calculation
  const otRatePerHour = (customOtRate !== null && customOtRate !== undefined && customOtRate !== '' && Number(customOtRate) > 0) 
    ? Number(customOtRate) 
    : Number((perDayRate / 8).toFixed(2));

  // 2. Days Worked
  const daysWorked = customDaysWorked !== null ? Number(customDaysWorked) : 28;
  const payableDays = daysWorked; 

  // 3. Base Earned Salary (Rounded Rate x Days)
  // 607.14 * 32 = 19428.48 -> Round to 19428 (Exactly Matches Calculator!)
  const baseEarnedSalaryExact = (daysWorked === 28) 
    ? Number(monthlySalary) 
    : (perDayRate * payableDays);

  const otAmountExact = otRatePerHour * Number(otHours);

  // 4. Rounding Off Earnings
  const baseEarnedSalary = Math.round(baseEarnedSalaryExact);
  const otAmount = Math.round(otAmountExact);
  
  // Gross Salary = Base + OT
  const grossSalary = baseEarnedSalary + otAmount;
  
  // 5. Deductions & Net Salary
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