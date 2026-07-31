// Base API URL configuration to handle Live Server (Port 5500) vs Backend (Port 3000)
const API_BASE_URL = window.location.port === '5500' ? 'http://localhost:3000' : '';

let authToken = localStorage.getItem('mse_token') || null;
let currentUsername = localStorage.getItem('mse_user') || null;
let isRegisterMode = false;
let uploadedLogoBase64 = "";
let attendanceSheetUrl = "";

// Initialize App
window.onload = () => {
  checkAuthStatus();
  updatePreview();
};

function checkAuthStatus() {
  const modal = document.getElementById('authModal');
  const userBadge = document.getElementById('userBadge');
  const logoutBtn = document.getElementById('logoutBtn');

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

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('authTitle').innerText = isRegisterMode ? 'Register New Account' : 'Login to Access Your Slips';
  document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Register' : 'Login';
}

async function handleAuth() {
  const username = document.getElementById('authUsername').value.trim();
  const password = document.getElementById('authPassword').value.trim();

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

// Logo File Handler
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedLogoBase64 = e.target.result;
      const img = document.getElementById('slipLogo');
      img.src = uploadedLogoBase64;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

// Number to Words Engine
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

// LIVE PREVIEW UPDATE ENGINE
async function updatePreview() {
  const companyName = document.getElementById('inCompanyName').value;
  const primaryColor = document.getElementById('inPrimaryColor').value;
  const fontFamily = document.getElementById('inFontFamily').value;

  const empName = document.getElementById('inEmpName').value;
  const empId = document.getElementById('inEmpId').value;
  const designation = document.getElementById('inDesignation').value;
  const monthYear = document.getElementById('inMonthYear').value;

  const monthlySalary = Number(document.getElementById('inMonthlySalary').value || 0);
  const daysWorked = Number(document.getElementById('inDaysWorked').value || 0);
  const daysInMonth = Number(document.getElementById('inDaysInMonth').value || 30);
  const otHours = Number(document.getElementById('inOtHours').value || 0);
  const daysPresent = Number(document.getElementById('inDaysPresent').value || 0);
  const daysAbsent = Number(document.getElementById('inDaysAbsent').value || 0);
  const totalHours = Number(document.getElementById('inTotalHours').value || 0);
  attendanceSheetUrl = document.getElementById('inAttendanceSheetUrl').value.trim();

  const pf = Number(document.getElementById('inPf').value || 0);
  const advance = Number(document.getElementById('inAdvance').value || 0);

  // Apply Styling Customizations Live
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.getElementById('salarySlipPdf').style.fontFamily = fontFamily;

  // Bind Text
  document.getElementById('outCompanyName').innerText = companyName;
  document.getElementById('outMonthYear').innerText = monthYear;
  document.getElementById('outEmpName').innerText = empName;
  document.getElementById('outEmpId').innerText = empId;
  document.getElementById('outDesignation').innerText = designation;

  // Call API Calculation
  try {
    const res = await fetch(`${API_BASE_URL}/api/slips/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlySalary, daysWorked, daysInMonth, otHours })
    });
    const calc = await res.json();

    document.getElementById('outMonthDays').innerText = daysInMonth;
    document.getElementById('outWorkedDays').innerText = daysWorked;
    document.getElementById('outPerDayRate').innerText = calc.perDayRate;
    document.getElementById('outOtRate').innerText = calc.otRatePerHour;
    document.getElementById('outPayableDays').innerText = calc.payableDays;
    document.getElementById('outOtHours').innerText = otHours;
    document.getElementById('outDaysPresent').innerText = daysPresent;
    document.getElementById('outDaysAbsent').innerText = daysAbsent;
    document.getElementById('outTotalHours').innerText = totalHours;
    document.getElementById('outOtHoursProof').innerText = otHours;

    // Note Callout Logic
    const noteEl = document.getElementById('outAttendanceNote');
    if (daysWorked === 28) {
      noteEl.innerText = "✅ Status: Full 28 Days Completed -> Full Month Salary Granted (0 Deductions).";
      noteEl.style.color = "#15803d";
    } else if (daysWorked > 28) {
      noteEl.innerText = `🔥 Status: Extra Continuous Work (${daysWorked} Days) -> 2 Sunday Bonus Incentive Included!`;
      noteEl.style.color = "#2563eb";
    } else {
      noteEl.innerText = "⚠️ Status: Short Attendance -> Salary Calculated on Exact Per-Day Worked Rate.";
      noteEl.style.color = "#b45309";
    }

    document.getElementById('outEarnedDaysLabel').innerText = calc.payableDays;
    document.getElementById('outOtHoursLabel').innerText = otHours;

    document.getElementById('outBaseSalary').innerText = `₹${calc.baseEarnedSalary.toLocaleString('en-IN')}`;
    document.getElementById('outOtAmount').innerText = `₹${calc.otAmount.toLocaleString('en-IN')}`;
    document.getElementById('outGross').innerText = `₹${calc.grossSalary.toLocaleString('en-IN')}`;

    document.getElementById('outPf').innerText = `₹${pf.toLocaleString('en-IN')}`;
    document.getElementById('outAdvance').innerText = `₹${advance.toLocaleString('en-IN')}`;

    const totalDeductions = pf + advance;
    document.getElementById('outDeductions').innerText = `₹${totalDeductions.toLocaleString('en-IN')}`;

    const sheetLinkContainer = document.getElementById('outAttendanceSheetLink');
    sheetLinkContainer.innerHTML = '';
    if (attendanceSheetUrl) {
      const anchor = document.createElement('a');
      anchor.href = attendanceSheetUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = attendanceSheetUrl;
      sheetLinkContainer.appendChild(anchor);
    } else {
      sheetLinkContainer.innerHTML = '<a href="#">Google Sheet link will appear here.</a>';
    }

    const netSalary = calc.grossSalary - totalDeductions;
    document.getElementById('outNetPay').innerText = `₹${netSalary.toLocaleString('en-IN')}`;
    document.getElementById('outInWords').innerText = numberToWords(netSalary);

  } catch (err) {
    console.error("Calculation Error", err);
  }
}

// SAVE TO DATABASE
async function saveSlipToDatabase() {
  if (!authToken) return alert('Please Login first to save slips!');

  const slipData = {
    slipNumber: `MSE-${Date.now().toString().slice(-4)}`,
    companyName: document.getElementById('inCompanyName').value,
    logoUrl: uploadedLogoBase64,
    primaryColor: document.getElementById('inPrimaryColor').value,
    fontFamily: document.getElementById('inFontFamily').value,
    employeeName: document.getElementById('inEmpName').value,
    employeeId: document.getElementById('inEmpId').value,
    designation: document.getElementById('inDesignation').value,
    monthYear: document.getElementById('inMonthYear').value,
    monthlySalary: Number(document.getElementById('inMonthlySalary').value),
    daysWorked: Number(document.getElementById('inDaysWorked').value),
    daysInMonth: Number(document.getElementById('inDaysInMonth').value),
    otHours: Number(document.getElementById('inOtHours').value),
    daysPresent: Number(document.getElementById('inDaysPresent').value),
    daysAbsent: Number(document.getElementById('inDaysAbsent').value),
    totalHours: Number(document.getElementById('inTotalHours').value),
    attendanceSheetUrl: attendanceSheetUrl,
    pfDeduction: Number(document.getElementById('inPf').value),
    advanceDeduction: Number(document.getElementById('inAdvance').value)
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

  document.getElementById('slipsModal').style.display = 'flex';
  const tbody = document.getElementById('savedSlipsList');
  tbody.innerHTML = '<tr><td colspan="5">Loading saved slips...</td></tr>';

  try {
    const res = await fetch(`${API_BASE_URL}/api/slips/my-slips`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const slips = await res.json();

    if (slips.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No saved slips found.</td></tr>';
      return;
    }

    tbody.innerHTML = slips.map(s => `
      <tr>
        <td>${new Date(s.createdAt).toLocaleDateString()}</td>
        <td><b>${s.employeeName}</b> (${s.employeeId})</td>
        <td>${s.monthYear}</td>
        <td>₹${s.netSalary.toLocaleString('en-IN')}</td>
        <td>
          <button class="btn btn-primary" onclick='loadSlipIntoEditor(${JSON.stringify(s)})'>Load</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5">Error loading slips.</td></tr>';
  }
}

function loadSlipIntoEditor(slip) {
  document.getElementById('inCompanyName').value = slip.companyName || '';
  document.getElementById('inPrimaryColor').value = slip.primaryColor || '#1e3a8a';
  document.getElementById('inFontFamily').value = slip.fontFamily || "'Inter', sans-serif";
  document.getElementById('inEmpName').value = slip.employeeName;
  document.getElementById('inEmpId').value = slip.employeeId;
  document.getElementById('inDesignation').value = slip.designation;
  document.getElementById('inMonthYear').value = slip.monthYear;
  document.getElementById('inMonthlySalary').value = slip.monthlySalary;
  document.getElementById('inDaysWorked').value = slip.daysWorked;
  document.getElementById('inDaysInMonth').value = slip.daysInMonth;
  document.getElementById('inOtHours').value = slip.otHours;
  document.getElementById('inDaysPresent').value = slip.daysPresent || 0;
  document.getElementById('inDaysAbsent').value = slip.daysAbsent || 0;
  document.getElementById('inTotalHours').value = slip.totalHours || 0;
  document.getElementById('inAttendanceSheetUrl').value = slip.attendanceSheetUrl || '';
  document.getElementById('inPf').value = slip.pfDeduction;
  document.getElementById('inAdvance').value = slip.advanceDeduction;

  if (slip.logoUrl) {
    uploadedLogoBase64 = slip.logoUrl;
    const img = document.getElementById('slipLogo');
    img.src = uploadedLogoBase64;
    img.style.display = 'block';
  }

  closeSavedSlipsModal();
  updatePreview();
}

function closeSavedSlipsModal() {
  document.getElementById('slipsModal').style.display = 'none';
}

// PDF DOWNLOAD ENGINE
function downloadPDF() {
  const element = document.getElementById('salarySlipPdf');
  const empName = document.getElementById('inEmpName').value || 'Employee';
  const month = document.getElementById('inMonthYear').value || 'Payslip';

  const opt = {
    margin:       0.3,
    filename:     `Salary_Slip_${empName}_${month}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}