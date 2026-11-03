function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, 
  year = new Date().getFullYear(),   
  customDaysInMonth = null,          
  customDaysWorked = null,          
  halfDays = 0,               // Naya parameter half-days ke liye
  otHours = 0, 
  customOtRate = null,
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  const actualDaysInMonth = new Date(year, month, 0).getDate();
  const daysInMonth = (customDaysInMonth && Number(customDaysInMonth) > 0) 
    ? Number(customDaysInMonth) 
    : actualDaysInMonth;

  // 1. Base Per Day Rate
  const rawPerDayRate = monthlySalary / daysInMonth;
  const perDayRate = Math.floor(rawPerDayRate); 

  // 2. OT Rate Calculation
  const calculatedOtRate = perDayRate / 8;
  const otRatePerHour = (customOtRate !== null && customOtRate !== undefined && customOtRate !== '' && Number(customOtRate) > 0) 
    ? Number(customOtRate) 
    : Math.floor(calculatedOtRate); 

  // 3. Days Worked with Half-Day adjustment (Har 1 half-day ka matlab 0.5 day kam hoga ya count hoga)
  const baseDaysWorked = customDaysWorked !== null ? Number(customDaysWorked) : daysInMonth;
  const totalHalfDays = Number(halfDays) || 0;
  
  // Effective payable days: Total present days me se half-days ka adha hissa (totalHalfDays * 0.5) minus ho jayega
  const payableDays = Math.max(0, baseDaysWorked - (totalHalfDays * 0.5));
  const daysWorked = payableDays; 

  // 4. Base Earned Salary Calculation
  const baseEarnedSalaryExact = (payableDays === daysInMonth) 
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
    halfDays: totalHalfDays,
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