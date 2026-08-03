function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, // Default current month (1 to 12)
  year = new Date().getFullYear(),   // Default current year (e.g. 2026)
  isFullAttendance = true,           // Full attendance boolean
  customDaysWorked = null,           // Agar kisi ne beech me leave li ho
  otHours = 0, 
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  // 1. Auto-detect total days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();

  // 2. Fixed 28-day base calculations
  const perDayRate = Number((monthlySalary / 28).toFixed(2));
  const otRatePerHour = Number((perDayRate / 8).toFixed(2));

  // 3. Determine Payable Days based on Month & Attendance
  let daysWorked = customDaysWorked !== null ? customDaysWorked : 28;
  let payableDays = daysWorked;

  if (isFullAttendance && daysWorked === 28) {
    // 28 days duty completed = Full Month Paid (30/31 Days)
    payableDays = daysInMonth; 
  } else if (daysWorked > 28) {
    // Continuous work incentive
    payableDays = daysWorked + 2;
  }

  // 4. Salary Math Calculations
  const baseEarnedSalary = Math.round(perDayRate * payableDays);
  const otAmount = Math.round(otRatePerHour * otHours);
  const grossSalary = baseEarnedSalary + otAmount;
  const totalDeductions = weeklyWages + pf + advance;
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