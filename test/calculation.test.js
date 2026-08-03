const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateSalarySlip } = require('../calculation');

test('calculates salary from user-entered values - 19000 salary with 20 days present', () => {
  const result = calculateSalarySlip({
    monthlySalary: 19000,
    daysPresent: 20,
    daysInMonth: 30,
    otHours: 0,
    weeklyWages: 4000,
    pf: 0,
    advance: 500
  });

  assert.equal(result.perDayRate, 678.57);
  assert.equal(result.baseEarnedSalary, 13571); // 678.57 * 20 = 13571.4 rounded
  assert.equal(result.otAmount, 0);
  assert.equal(result.grossSalary, 13571);
  assert.equal(result.weeklyWages, 4000);
  assert.equal(result.totalDeductions, 4500);
  assert.equal(result.netSalary, 9071); // 13571 - 4500 = 9071
});
