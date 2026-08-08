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

  // 1. Unrounded Rates
  const exactPerDayRate = monthlySalary / 28;
  const exactOtRatePerHour = exactPerDayRate / 8;

  // 2. Display & Exact Multiplier Rates (Fixed to 2 Decimals)
  const perDayRate = Number(exactPerDayRate.toFixed(2));     // 607.14
  const otRatePerHour = Number(exactOtRatePerHour.toFixed(2)); // 75.89

  // 3. Determine Days Worked & Payable Days
  let daysWorked = customDaysWorked !== null ? customDaysWorked : 28;
  let payableDays = daysWorked;

  if (isFullAttendance && daysWorked === 28) {
    payableDays = daysInMonth; 
  } else if (daysWorked > 28) {
    payableDays = daysWorked + 2;
  }

  // 4. Base Earned Salary Calculation (FIX HERE)
  let baseEarnedSalary;
  
  if (isFullAttendance && daysWorked === 28 && payableDays === 28) {
    baseEarnedSalary = monthlySalary;
  } else {
    // Hidden decimals ki jagah perDayRate (607.14) se multiply karein
    baseEarnedSalary = Math.round(perDayRate * payableDays);
  }

  // 5. OT Amount Calculation
  const otAmount = Math.round(otRatePerHour * otHours);

  // 6. Final Calculations
  const grossSalary = baseEarnedSalary + otAmount;
  const totalDeductions = Math.round(weeklyWages + pf + advance);
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
    weeklyWages,
    pf,
    advance,
    totalDeductions,
    netSalary
  };
}

module.exports = { calculateSalarySlip };