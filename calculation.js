function calculateSalarySlip({ 
  monthlySalary = 0, 
  month = new Date().getMonth() + 1, 
  year = new Date().getFullYear(),   
  isFullAttendance = true,           
  customDaysWorked = null,           
  otHours = 0, 
  customOtRate = null,
  weeklyWages = 0, 
  pf = 0, 
  advance = 0 
}) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Daily Rate & OT Ratek
  const perDayRate = Number((monthlySalary / 28).toFixed(2));
  const otRatePerHour = customOtRate ? Number(customOtRate) : Number((perDayRate / 8).toFixed(2));

  // 2. Days Logic
  let daysWorked = customDaysWorked !== null ? customDaysWorked : 28;
  let payableDays = daysWorked;

  if (isFullAttendance && daysWorked === 28) {
    payableDays = daysInMonth; 
  } else if (daysWorked > 28) {
    payableDays = daysWorked + 2;
  }

  // 3. Base Earned Salary Calculation
  let baseEarnedSalary;
  if (isFullAttendance && daysWorked === 28 && payableDays === 28) {
    baseEarnedSalary = monthlySalary;
  } else {
    baseEarnedSalary = Math.floor(perDayRate * payableDays);
  }

  // 4. OT Amount (Math.floor se ₹1 extra nahi aayega)
  const otAmount = Math.floor(otRatePerHour * otHours);

  // 5. Deductions & Totals
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

// Browser aur Node.js dono ke liye Export Fix
export { calculateSalarySlip };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateSalarySlip };
}