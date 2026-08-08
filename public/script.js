import { calculateSalarySlip } from '../calculation.js';

const API_BASE_URL = 'https://salary-slip-daoy.onrender.com';

let authToken = localStorage.getItem('mse_token') || null;
let currentUsername = localStorage.getItem('mse_user') || null;
let isRegisterMode = false;
let uploadedLogoBase64 = "";

function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  const allInputs = document.querySelectorAll('input, select, textarea');
  allInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
    input.addEventListener('keyup', updatePreview);
  });

  document.getElementById('btnRefreshPreview')?.addEventListener('click', updatePreview);
  document.getElementById('inLogoUpload')?.addEventListener('change', handleLogoUpload);

  updatePreview();
});

function checkAuthStatus() {
  const modal = document.getElementById('authModal');
  const userBadge = document.getElementById('userBadge');
  const logoutBtn = document.getElementById('logoutBtn');

  if (modal && userBadge && logoutBtn) {
    if (authToken && currentUsername) {
      modal.style.display = 'none';
      userBadge.innerText = `👤 ${currentUsername}`;
      logoutBtn.style.display = 'inline-block';
    } else {
      modal.style.display = 'flex';
      userBadge.innerText = 'Not Logged In';
      logoutBtn.style.display = 'none';
    }
  }
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedLogoBase64 = e.target.result;
      const img = document.getElementById('slipLogo');
      if (img) {
        img.src = uploadedLogoBase64;
        img.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
}

function numberToWords(num) {
  const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Lakh ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Thousand ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str;
}

async function updatePreview() {
  const companyName = document.getElementById('inCompanyName')?.value || 'M.S ENTERPRISES';
  const primaryColor = document.getElementById('inPrimaryColor')?.value || '#1e3a8a';
  const fontFamily = document.getElementById('inFontFamily')?.value || 'Georgia';

  const empName = document.getElementById('inEmpName')?.value || '';
  const empId = document.getElementById('inEmpId')?.value || '';
  const designation = document.getElementById('inDesignation')?.value || '';
  const monthYear = document.getElementById('inMonthYear')?.value || '';

  const monthlySalary = Number(document.getElementById('inMonthlySalary')?.value || 0);
  const customDaysWorked = Number(document.getElementById('inDaysPresent')?.value || document.getElementById('inDaysWorked')?.value || 0);
  const otHours = Number(document.getElementById('inOtHours')?.value || 0);
  const customOtRate = Number(document.getElementById('inOtRate')?.value || 0);
  const totalHours = document.getElementById('inTotalHours')?.value || '0';

  const weeklyWages = Number(document.getElementById('inWeeklyWages')?.value || document.getElementById('inKharchi')?.value || 0);
  const pf = Number(document.getElementById('inPf')?.value || 0);
  const advance = Number(document.getElementById('inAdvance')?.value || 0);

  const result = calculateSalarySlip({
    monthlySalary,
    customDaysWorked,
    otHours,
    customOtRate: customOtRate > 0 ? customOtRate : null,
    weeklyWages,
    pf,
    advance
  });

  document.documentElement.style.setProperty('--primary-color', primaryColor);
  const pdfContainer = document.getElementById('salarySlipPdf');
  if (pdfContainer) pdfContainer.style.fontFamily = fontFamily;

  setElementText('outCompanyName', companyName);
  setElementText('outMonthYear', monthYear);
  setElementText('outEmpName', empName);
  setElementText('outEmpId', empId);
  setElementText('outDesignation', designation);
  setElementText('outMonthDays', result.daysInMonth);

  setElementText('outWorkedDays', result.daysWorked);
  setElementText('outDaysPresent', customDaysWorked);
  setElementText('outDaysAbsent', Math.max(0, result.daysInMonth - customDaysWorked));
  setElementText('outOtHours', otHours);
  setElementText('outTotalHours', totalHours);

  // Auto Search Sheet URL Input
  const attendanceUrlInput = 
    document.getElementById('inAttendanceSheetUrl') || 
    document.getElementById('inAttendanceUrl') || 
    document.getElementById('inSheetUrl') ||
    document.querySelector('input[type="url"]');

  const attendanceSheetUrl = attendanceUrlInput ? attendanceUrlInput.value.trim() : '';
  const sheetLink = document.getElementById('outAttendanceLink');

  if (sheetLink) {
    if (attendanceSheetUrl && attendanceSheetUrl.startsWith('http')) {
      sheetLink.href = attendanceSheetUrl;
      sheetLink.target = "_blank";
      sheetLink.innerText = "View Sheet";
      sheetLink.style.color = "#2563eb";
      sheetLink.style.textDecoration = "underline";
    } else {
      sheetLink.innerText = "Not provided";
      sheetLink.removeAttribute('href');
      sheetLink.style.color = "inherit";
      sheetLink.style.textDecoration = "none";
    }
  }

  // Multi-selector to update UI Elements safely
  const setMultiText = (selectors, text) => {
    selectors.forEach(sel => {
      const el = document.getElementById(sel) || document.querySelector(sel);
      if (el) el.innerText = text;
    });
  };

  setMultiText(['perDayRateDisplay', 'outPerDayRate'], `₹${result.perDayRate.toFixed(2)}`);
  setMultiText(['otRateDisplay', 'outOtRate'], `₹${result.otRatePerHour.toFixed(2)}`);
  setMultiText(['baseSalaryDisplay', 'outBaseSalary'], `₹${result.baseEarnedSalary.toLocaleString('en-IN')}`);
  setMultiText(['otAmountDisplay', 'outOtAmount'], `₹${result.otAmount.toLocaleString('en-IN')}`);
  setMultiText(['grossSalaryDisplay', 'outGrossSalary'], `₹${result.grossSalary.toLocaleString('en-IN')}`);

  setMultiText(['outPayableDays'], result.payableDays);
  setMultiText(['outWeeklyWages', 'outKharchi'], `₹${result.weeklyWages.toLocaleString('en-IN')}`);
  setMultiText(['outPf'], `₹${result.pf.toLocaleString('en-IN')}`);
  setMultiText(['outAdvance'], `₹${result.advance.toLocaleString('en-IN')}`);
  setMultiText(['outDeductions'], `₹${result.totalDeductions.toLocaleString('en-IN')}`);
  setMultiText(['outNetPay', 'netPayDisplay'], `₹${result.netSalary.toLocaleString('en-IN')}`);

  if (typeof numberToWords === 'function') {
    setElementText('outInWords', `${numberToWords(result.netSalary)} Only`);
  }
}

window.downloadPDF = function() {
  const element = document.querySelector('.salary-slip-document') || document.getElementById('salarySlipPdf');
  const empName = document.getElementById('inEmpName')?.value || 'Employee';
  const month = document.getElementById('inMonthYear')?.value || 'Payslip';

  if (!element) return alert('Salary slip preview element not found!');

  const opt = {
    margin:       [0.3, 0.3, 0.3, 0.3],
    filename:     `Salary_Slip_${empName}_${month}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};