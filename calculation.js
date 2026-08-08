function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, // Default current month (1 to 12)
  year = new Date().getFullYear(),   // Default current year
  isFullAttendance = true,           // Full attendance boolean
  customDaysWorked = null,           // Leaves li hon toh
  otHours = 0, 
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  // 1. Auto-detect total days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();

  // 2. Base Rates - Absolute 2-decimal Fixed Numbers
  // Unrounded numbers carry mathematical drift, so we round rate first!
  const perDayRate = Number((monthlySalary / 28).toFixed(2));
  const otRatePerHour = Number((perDayRate / 8).toFixed(2));

  // 3. Determine Payable Days
  let daysWorked = customDaysWorked !== null ? customDaysWorked : 28;
  let payableDays = daysWorked;

  if (isFullAttendance && daysWorked === 28) {
    payableDays = daysInMonth; 
  } else if (daysWorked > 28) {
    payableDays = daysWorked + 2;
  }

  // 4. Earned Salary Math (Strict Math.floor on Rounded Rates)
  let baseEarnedSalary;
  
  if (isFullAttendance && daysWorked === 28) {
    // Full attendance = Direct fixed monthly salary
    baseEarnedSalary = monthlySalary; 
  } else {
    // Calculated directly from the fixed 2-decimal perDayRate
    baseEarnedSalary = Math.floor(perDayRate * payableDays);
  }

  // 5. OT Amount Calculation
  const otAmount = Math.floor(otRatePerHour * otHours);

  // 6. Gross, Deductions & Net Salary
  const grossSalary = baseEarnedSalary + otAmount;
  const totalDeductions = Math.floor(weeklyWages + pf + advance);
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