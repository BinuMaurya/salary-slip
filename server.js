require('dotenv').config(); // Load .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { calculateSalarySlip } = require('./calculation');

const app = express();

// --- Configuration ---
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ CRITICAL ERROR: MONGO_URI is missing in environment variables!');
  process.exit(1);
}

// --- Middlewares ---
app.use(express.json({ limit: '10mb' })); // For base64 logo images
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// --- Force public DNS for Atlas SRV resolution ---
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// --- Database Connection ---
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    tls: MONGO_URI.startsWith('mongodb+srv://')
  })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// --- Schemas ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const slipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slipNumber: String,
  companyName: String,
  logoUrl: String,
  primaryColor: String,
  fontFamily: String,
  employeeName: String,
  employeeId: String,
  designation: String,
  monthYear: String,
  monthlySalary: Number,
  daysWorked: Number,
  daysInMonth: Number,
  otHours: Number,
  payableDays: Number,
  perDayRate: Number,
  otRatePerHour: Number,
  baseEarnedSalary: Number,
  otAmount: Number,
  grossSalary: Number,
  pfDeduction: Number,
  esiDeduction: Number,
  advanceDeduction: Number,
  totalDeductions: Number,
  netSalary: Number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Slip = mongoose.model('Slip', slipSchema);

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username: username.toLowerCase().trim(), password: hashedPassword });
    await user.save();
    
    console.log('✅ User registered:', username);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('❌ Register Error:', err.message);
    res.status(500).json({ error: 'Error creating user: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ User logged in:', username);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ error: 'Login error: ' + err.message });
  }
});

// --- Salary Calculation Logic Engine ---
function calculateExactSalary(monthlySalary = 0, daysPresent = 0, daysInMonth = 30, otHours = 0, weeklyWages = 0, pf = 0, advance = 0) {
  return calculateSalarySlip({ monthlySalary, daysPresent, daysInMonth, otHours, weeklyWages, pf, advance });
}

// --- Salary Slip CRUD Routes ---
app.post('/api/slips/calculate', (req, res) => {
    try {
        const { 
            monthlySalary = 0, 
            daysInMonth = 28, 
            daysPresent = 0, 
            otHours = 0, 
            kharchi = 0, 
            advance = 0,
            pf = 0
        } = req.body;

        const numSalary = Number(monthlySalary);
        const numDaysInMonth = Number(daysInMonth) || 28;
        const numPresent = Number(daysPresent);
        const numOtHours = Number(otHours);
        const numKharchi = Number(kharchi);
        const numAdvance = Number(advance);
        const numPf = Number(pf);

        // 1. Per Day Rate Calculation
        const perDayRate = numDaysInMonth > 0 ? (numSalary / numDaysInMonth) : 0;

        // 2. Base Earned Salary based on ACTUAL Present Days
        const baseEarnedSalary = perDayRate * numPresent;

        // 3. OT Rate per Hour (Standard 8 Hours Working Day)
        const otRatePerHour = perDayRate / 8;
        const otAmount = otRatePerHour * numOtHours;

        // 4. Gross Salary
        const grossSalary = baseEarnedSalary + otAmount;

        // 5. Deductions (Kharchi + Advance + PF)
        const totalDeductions = numKharchi + numAdvance + numPf;

        // 6. Final Net Payable Salary
        const netSalary = grossSalary - totalDeductions;

        return res.json({
            perDayRate: perDayRate.toFixed(2),
            otRatePerHour: otRatePerHour.toFixed(2),
            baseEarnedSalary: Math.round(baseEarnedSalary),
            otAmount: Math.round(otAmount),
            grossSalary: Math.round(grossSalary),
            totalDeductions: Math.round(totalDeductions),
            netSalary: Math.round(netSalary),
            // Also pass back payableDays for consistency with old structure if needed by frontend
            payableDays: numPresent 
        });

    } catch (error) {
        console.error("Calculation Engine Error:", error);
        res.status(500).json({ error: "Failed to calculate salary" });
    }
});

app.post('/api/slips/save', authenticateToken, async (req, res) => {
  try {
    const calc = calculateExactSalary(
      Number(req.body.monthlySalary || 0),
      Number(req.body.daysPresent || 0),
      Number(req.body.daysInMonth || 30),
      Number(req.body.otHours || 0),
      Number(req.body.weeklyWages || 0),
      Number(req.body.pf || 0),
      Number(req.body.advance || 0)
    );

    const newSlip = new Slip({
      ...req.body,
      userId: req.user.userId,
      ...calc
    });

    await newSlip.save();
    res.status(201).json({ message: 'Salary Slip Saved Lifetime!', slip: newSlip });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save salary slip' });
  }
});

app.get('/api/slips/my-slips', authenticateToken, async (req, res) => {
  try {
    const slips = await Slip.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(slips);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slips' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server active on http://localhost:${PORT}`));