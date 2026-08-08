function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, // Default current month (1 to 12)
  year = new Date().getFullYear(),   // Default current year
  isFullAttendance = true,           // Full attendance boolean
  customDaysWorked = null,           // Agar kisi ne beech me leave li ho
  otHours = 0, 
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  // 1. Auto-detect total days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();

  // 2. Base rate calculation (Exact values)
  const exactPerDayRate = monthlySalary / 28;
  const exactOtRatePerHour = exactPerDayRate / 8;

  // Display ke liye 2 decimals tak
  const perDayRate = Number(exactPerDayRate.toFixed(2));
  const otRatePerHour = Number(exactOtRatePerHour.toFixed(2));

  // 3. Determine Payable Days
  let daysWorked = customDaysWorked !== null ? customDaysWorked : 28;
  let payableDays = daysWorked;

  if (isFullAttendance && daysWorked === 28) {
    payableDays = daysInMonth; 
  } else if (daysWorked > 28) {
    payableDays = daysWorked + 2;
  }

  // 4. Base Earned Salary Calculation (FIXED)
  let baseEarnedSalary;
  if (isFullAttendance && daysWorked === 28) {
    // Agar full attendance hai, to direct fixed salary do (taaki division/multiplication error na aaye)
    baseEarnedSalary = monthlySalary;
  } else {
    // Exact rate se multiply karke floor kar diya taaki ek paisa bhi extra na bane
    baseEarnedSalary = Math.floor(exactPerDayRate * payableDays);
  }

  // 5. OT Amount Calculation (Math.floor se extra rupee zero ho jayega)
  const otAmount = Math.floor(exactOtRatePerHour * otHours);

  // 6. Gross & Net Salary
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