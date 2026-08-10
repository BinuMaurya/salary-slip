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

  // 1. Per Day Rate & OT Rate Calculations
  const exactPerDayRate = monthlySalary / 28;
  
  // Custom OT Rate check (Safety fix: check if valid custom rate passed)
  const exactOtRate = (customOtRate !== null && customOtRate !== undefined && customOtRate !== '') 
    ? Number(customOtRate) 
    : (exactPerDayRate / 8);

  // Display Rates (2 Decimals for UI)
  const perDayRate = Number(exactPerDayRate.toFixed(2));
  const otRatePerHour = Number(exactOtRate.toFixed(2));

  // 2. Days Worked
  const daysWorked = customDaysWorked !== null ? Number(customDaysWorked) : 28;
  const payableDays = daysWorked; 

  // 3. Exact Earnings Calculations
  const baseEarnedSalaryExact = (daysWorked === 28) 
    ? Number(monthlySalary) 
    : (exactPerDayRate * payableDays);

  const otAmountExact = exactOtRate * Number(otHours);

  // 4. Exact Deductions
  const totalDeductionsExact = Number(weeklyWages) + Number(pf) + Number(advance);

  // 5. Unified Rounding Logic (To avoid +1 mismatch)
  // Sabhi components ko Math.round() se sync karke exact summation banayenge
  const baseEarnedSalary = Math.round(baseEarnedSalaryExact);
  const otAmount = Math.round(otAmountExact);
  
  // Gross is sum of rounded parts so that table breakdown ALWAYS matches Gross Total
  const grossSalary = baseEarnedSalary + otAmount;
  
  const totalDeductions = Math.round(totalDeductionsExact);
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