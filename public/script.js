const API_BASE_URL = 'http://localhost:3000';

let authToken = localStorage.getItem('mse_token') || null;
let currentUsername = localStorage.getItem('mse_user') || null;
let isRegisterMode = false;
let uploadedLogoBase64 = "";

// Helper Function: Safe Text Update
function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = text;
  }
}

// INITIALIZE APP & AUTO EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  // Attach event listeners to ALL inputs across the whole document
  const allInputs = document.querySelectorAll('input, select, textarea');
  allInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
    input.addEventListener('keyup', updatePreview);
  });

  // Refresh Preview button fallback
  document.getElementById('btnRefreshPreview')?.addEventListener('click', updatePreview);

  // Logo upload handler
  document.getElementById('inLogoUpload')?.addEventListener('change', handleLogoUpload);

  // Run initial preview calculation
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

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  setElementText('authTitle', isRegisterMode ? 'Register New Account' : 'Login to Access Your Slips');
  setElementText('authSubmitBtn', isRegisterMode ? 'Register' : 'Login');
}

async function handleAuth() {
  const username = document.getElementById('authUsername')?.value.trim();
  const password = document.getElementById('authPassword')?.value.trim();

  if (!username || !password) return alert('Username & Password required');

  const endpoint = isRegisterMode ? '/api/register' : '/api/login';
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Auth failed');

    if (isRegisterMode) {
      alert('Registration successful! Please login.');
      toggleAuthMode();
    } else {
      authToken = data.token;
      currentUsername = data.username;
      localStorage.setItem('mse_token', authToken);
      localStorage.setItem('mse_user', currentUsername);
      checkAuthStatus();
    }
  } catch (err) {
    alert(err.message || 'Server connection failed');
  }
}

function logout() {
  localStorage.removeItem('mse_token');
  localStorage.removeItem('mse_user');
  authToken = null;
  currentUsername = null;
  checkAuthStatus();
}

// Logo Handler
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

// Number to Words Converter
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

// COMPLETE LIVE PREVIEW & CALCULATION ENGINE
async function updatePreview() {
  // 1. Basic Details Read
  const companyName = document.getElementById('inCompanyName')?.value || 'M.S ENTERPRISES';
  const primaryColor = document.getElementById('inPrimaryColor')?.value || '#1e3a8a';
  const fontFamily = document.getElementById('inFontFamily')?.value || 'Georgia';

  const empName = document.getElementById('inEmpName')?.value || '';
  const empId = document.getElementById('inEmpId')?.value || '';
  const designation = document.getElementById('inDesignation')?.value || '';
  const monthYear = document.getElementById('inMonthYear')?.value || '';

  // 2. Attendance & Salary Inputs Read
  const monthlySalary = Number(document.getElementById('inMonthlySalary')?.value || 0);
  const daysInMonth = Number(document.getElementById('inDaysInMonth')?.value || 28);
  const daysPresent = Number(document.getElementById('inDaysPresent')?.value || 0);
  const daysAbsent = Number(document.getElementById('inDaysAbsent')?.value || 0);
  const daysWorked = Number(document.getElementById('inDaysWorked')?.value || 0);
  const otHours = Number(document.getElementById('inOtHours')?.value || 0);
  const totalHours = Number(document.getElementById('inTotalHours')?.value || 0);

  // Attendance Sheet Input Read (Guaranteed Single Declaration)
  const attendanceUrlInput = 
    document.getElementById('inAttendanceSheetUrl') || 
    document.getElementById('inAttendanceUrl') || 
    document.getElementById('inSheetUrl') ||
    document.querySelector('input[placeholder*="docs.google.com"]') ||
    document.querySelector('input[type="url"]');

  const attendanceSheetUrl = attendanceUrlInput ? attendanceUrlInput.value.trim() : '';

  // 3. Deductions Inputs Read
  const weeklyWagesInput = document.getElementById('inWeeklyWages') || document.getElementById('inKharchi');
  const weeklyWages = Number(weeklyWagesInput?.value || 0);

  const pfInput = document.getElementById('inPf');
  const pf = Number(pfInput?.value || 0);

  const advanceInput = document.getElementById('inAdvance');
  const advance = Number(advanceInput?.value || 0);

  // 4. Update Custom Theme & Font
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  const pdfContainer = document.getElementById('salarySlipPdf');
  if (pdfContainer) pdfContainer.style.fontFamily = fontFamily;

  // 5. Update Header & Employee Info UI
  setElementText('outCompanyName', companyName);
  setElementText('outMonthYear', monthYear);
  setElementText('outEmpName', empName);
  setElementText('outEmpId', empId);
  setElementText('outDesignation', designation);
  setElementText('outMonthDays', daysInMonth);

  // 6. Update Attendance Summary UI
  setElementText('outWorkedDays', daysWorked);
  setElementText('outDaysPresent', daysPresent);
  setElementText('outDaysAbsent', daysAbsent);
  setElementText('outOtHours', otHours);
  setElementText('outTotalHours', totalHours);

  // Attendance Link Update Engine
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

  // 7. Salary Calculations
  const perDayRate = daysInMonth > 0 ? (monthlySalary / daysInMonth) : 0;
  const baseEarnedSalary = perDayRate * daysPresent;
  const otRatePerHour = perDayRate / 8;
  const otAmount = otRatePerHour * otHours;
  const grossSalary = baseEarnedSalary + otAmount;

  const totalDeductions = weeklyWages + pf + advance;
  const netSalary = grossSalary - totalDeductions;

  // 8. Render Earnings & Deductions UI
  setElementText('outPerDayRate', `₹${perDayRate.toFixed(2)}`);
  setElementText('outOtRate', `₹${otRatePerHour.toFixed(2)}`);
  setElementText('outPayableDays', daysPresent);

  setElementText('outBaseSalary', `₹${Math.round(baseEarnedSalary).toLocaleString('en-IN')}`);
  setElementText('outOtAmount', `₹${Math.round(otAmount).toLocaleString('en-IN')}`);
  setElementText('outGross', `₹${Math.round(grossSalary).toLocaleString('en-IN')}`);

  // Deductions UI Update
  const outWeeklyEl = document.getElementById('outWeeklyWages') || document.getElementById('outKharchi');
  if (outWeeklyEl) outWeeklyEl.innerText = `₹${weeklyWages.toLocaleString('en-IN')}`;

  setElementText('outPf', `₹${pf.toLocaleString('en-IN')}`);
  setElementText('outAdvance', `₹${advance.toLocaleString('en-IN')}`);
  setElementText('outDeductions', `₹${totalDeductions.toLocaleString('en-IN')}`);

  setElementText('outNetPay', `₹${Math.round(netSalary).toLocaleString('en-IN')}`);

  // Amount In Words
  if (typeof numberToWords === 'function') {
    setElementText('outInWords', `${numberToWords(Math.round(netSalary))} Only`);
  }
}

// SAVE TO DATABASE
async function saveSlipToDatabase() {
  if (!authToken) return alert('Please Login first to save slips!');

  const weeklyWagesInput = document.getElementById('inWeeklyWages') || document.getElementById('inKharchi');
  const attendanceUrlInput = 
    document.getElementById('inAttendanceSheetUrl') || 
    document.getElementById('inAttendanceUrl') || 
    document.getElementById('inSheetUrl');

  const slipData = {
    slipNumber: `MSE-${Date.now().toString().slice(-4)}`,
    companyName: document.getElementById('inCompanyName')?.value || '',
    logoUrl: uploadedLogoBase64,
    primaryColor: document.getElementById('inPrimaryColor')?.value || '#1e3a8a',
    fontFamily: document.getElementById('inFontFamily')?.value || "Georgia",
    employeeName: document.getElementById('inEmpName')?.value || '',
    employeeId: document.getElementById('inEmpId')?.value || '',
    designation: document.getElementById('inDesignation')?.value || '',
    monthYear: document.getElementById('inMonthYear')?.value || '',
    monthlySalary: Number(document.getElementById('inMonthlySalary')?.value || 0),
    daysWorked: Number(document.getElementById('inDaysWorked')?.value || 0),
    daysInMonth: Number(document.getElementById('inDaysInMonth')?.value || 28),
    otHours: Number(document.getElementById('inOtHours')?.value || 0),
    daysPresent: Number(document.getElementById('inDaysPresent')?.value || 0),
    daysAbsent: Number(document.getElementById('inDaysAbsent')?.value || 0),
    totalHours: Number(document.getElementById('inTotalHours')?.value || 0),
    attendanceSheetUrl: attendanceUrlInput?.value || '',
    weeklyWages: Number(weeklyWagesInput?.value || 0),
    pfDeduction: Number(document.getElementById('inPf')?.value || 0),
    advanceDeduction: Number(document.getElementById('inAdvance')?.value || 0)
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/slips/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(slipData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert('🎉 Salary Slip Saved Lifetime in Account!');
  } catch (err) {
    alert('Failed to save slip: ' + err.message);
  }
}

// FETCH SAVED SLIPS
async function openSavedSlipsModal() {
  if (!authToken) return alert('Please Login first!');

  const modal = document.getElementById('slipsModal');
  if (modal) modal.style.display = 'flex';

  const tbody = document.getElementById('savedSlipsList');
  if (tbody) tbody.innerHTML = '<tr><td colspan="5">Loading saved slips...</td></tr>';

  try {
    const res = await fetch(`${API_BASE_URL}/api/slips/my-slips`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const slips = await res.json();

    if (!tbody) return;

    if (slips.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No saved slips found.</td></tr>';
      return;
    }

    tbody.innerHTML = slips.map(s => `
      <tr>
        <td>${new Date(s.createdAt).toLocaleDateString()}</td>
        <td><b>${s.employeeName}</b> (${s.employeeId})</td>
        <td>${s.monthYear}</td>
        <td>₹${(s.netSalary || 0).toLocaleString('en-IN')}</td>
        <td>
          <button class="btn btn-primary" onclick='loadSlipIntoEditor(${JSON.stringify(s)})'>Load</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="5">Error loading slips.</td></tr>';
  }
}

function loadSlipIntoEditor(slip) {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : '';
  };

  setVal('inCompanyName', slip.companyName);
  setVal('inPrimaryColor', slip.primaryColor || '#1e3a8a');
  setVal('inFontFamily', slip.fontFamily || "Georgia");
  setVal('inEmpName', slip.employeeName);
  setVal('inEmpId', slip.employeeId);
  setVal('inDesignation', slip.designation);
  setVal('inMonthYear', slip.monthYear);
  setVal('inMonthlySalary', slip.monthlySalary);
  setVal('inDaysWorked', slip.daysWorked);
  setVal('inDaysInMonth', slip.daysInMonth);
  setVal('inOtHours', slip.otHours);
  setVal('inDaysPresent', slip.daysPresent);
  setVal('inDaysAbsent', slip.daysAbsent);
  setVal('inTotalHours', slip.totalHours);

  // Set URL into input
  setVal('inAttendanceSheetUrl', slip.attendanceSheetUrl);
  setVal('inAttendanceUrl', slip.attendanceSheetUrl);
  setVal('inSheetUrl', slip.attendanceSheetUrl);

  setVal('inWeeklyWages', slip.weeklyWages);
  setVal('inKharchi', slip.weeklyWages);
  setVal('inPf', slip.pfDeduction);
  setVal('inAdvance', slip.advanceDeduction);

  if (slip.logoUrl) {
    uploadedLogoBase64 = slip.logoUrl;
    const img = document.getElementById('slipLogo');
    if (img) {
      img.src = uploadedLogoBase64;
      img.style.display = 'block';
    }
  }

  closeSavedSlipsModal();
  updatePreview();
}

function closeSavedSlipsModal() {
  const modal = document.getElementById('slipsModal');
  if (modal) modal.style.display = 'none';
}

// PDF DOWNLOAD ENGINE
// FINAL & 100% WORKING PDF DOWNLOAD ENGINE
function downloadPDF() {
  const element = document.querySelector('.salary-slip-document') || document.getElementById('salarySlipPdf');
  const empName = document.getElementById('inEmpName')?.value || 'Employee';
  const month = document.getElementById('inMonthYear')?.value || 'Payslip';

  if (!element) return alert('Salary slip preview element not found!');

  const opt = {
    margin:       [0.3, 0.3, 0.3, 0.3], // Top, Left, Bottom, Right margin
    filename:     `Salary_Slip_${empName}_${month}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      scrollY: 0, 
      scrollX: 0
    },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}