function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, 
  year = new Date().getFullYear(),   
  customDaysInMonth = null,          
  customDaysWorked = null,          
  otHours = 0, 
  customOtRate = null,
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  // Agar customDaysInMonth pass kiya gaya hai toh wo use hoga, nahi toh month ke actual days
  const actualDaysInMonth = new Date(year, month, 0).getDate();
  const daysInMonth = (customDaysInMonth && Number(customDaysInMonth) > 0) 
    ? Number(customDaysInMonth) 
    : actualDaysInMonth;

  // 1. Base Per Day Rate (monthlySalary / daysInMonth, decimal ke baad ki value hta kar)
  const rawPerDayRate = monthlySalary / daysInMonth;
  const perDayRate = Math.floor(rawPerDayRate); 

  // 2. OT Rate Calculation (perDayRate / 8, decimal ke baad ki value hta kar)
  const calculatedOtRate = perDayRate / 8;
  const otRatePerHour = (customOtRate !== null && customOtRate !== undefined && customOtRate !== '' && Number(customOtRate) > 0) 
    ? Number(customOtRate) 
    : Math.floor(calculatedOtRate); 

  // 3. Days Worked
  const daysWorked = customDaysWorked !== null ? Number(customDaysWorked) : daysInMonth;
  const payableDays = daysWorked; 

  // 4. Base Earned Salary Calculation
  const baseEarnedSalaryExact = (daysWorked === daysInMonth) 
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