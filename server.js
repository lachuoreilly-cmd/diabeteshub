
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'diabetes-hub-prod-secret-2025';

// Database Pool Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Session expired.' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/v1/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(password || 'metabolic123', 10);
    
    // 1. Create User
    const userRes = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email.toLowerCase(), passwordHash]
    );
    const user = userRes.rows[0];

    // 2. Create Default Profile
    const profileRes = await client.query(
      'INSERT INTO profiles (user_id, name, relationship) VALUES ($1, $2, $3) RETURNING id',
      [user.id, name, 'Self']
    );
    const profileId = profileRes.rows[0].id;

    // 3. Update User with Active Profile
    await client.query('UPDATE users SET active_profile_id = $1 WHERE id = $2', [profileId, user.id]);
    
    await client.query('COMMIT');
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: { ...user, activeProfileId: profileId }, token });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(400).json({ message: 'Email already exists.' });
    res.status(500).json({ message: 'Registration failed.' });
  } finally {
    client.release();
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password || 'metabolic123', user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, activeProfileId: user.active_profile_id }, 
      token 
    });
  } catch (err) {
    res.status(500).json({ message: 'Login service unavailable.' });
  }
});

// --- USER & DATA HYDRATION ---
app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, active_profile_id as "activeProfileId" FROM users WHERE id = $1', 
      [req.user.id]
    );
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Hydrate all profiles for the user
    const profilesRes = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    user.profiles = await Promise.all(profilesRes.rows.map(async (p) => {
      const history = await pool.query('SELECT * FROM assessment_results WHERE profile_id = $1 ORDER BY date DESC', [p.id]);
      const glucose = await pool.query('SELECT * FROM glucose_logs WHERE profile_id = $1 ORDER BY timestamp DESC LIMIT 50', [p.id]);
      const meals = await pool.query('SELECT * FROM meal_logs WHERE profile_id = $1 ORDER BY timestamp DESC LIMIT 20', [p.id]);
      const hba1c = await pool.query('SELECT * FROM hba1c_history WHERE profile_id = $1 ORDER BY date DESC', [p.id]);
      const medications = await pool.query('SELECT * FROM medications WHERE profile_id = $1', [p.id]);

      return {
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        ethnicity: p.ethnicity,
        dietPreference: p.diet_preference,
        history: history.rows,
        glucoseLogs: glucose.rows,
        mealLogs: meals.rows,
        hba1cHistory: hba1c.rows,
        currentMedications: medications.rows,
        exerciseLogs: [], // Fallback
        myExercisePlans: [], // Fallback
        exerciseSessions: [], // Fallback
        savedRecipes: [] // Fallback
      };
    }));

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to hydrate health records.' });
  }
});

// --- CORE DATA OPERATIONS ---
app.post('/api/v1/profiles/:profileId/glucose', authenticateToken, async (req, res) => {
  const { value, type, timestamp } = req.body;
  try {
    const resLog = await pool.query(
      'INSERT INTO glucose_logs (profile_id, value, type, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.profileId, value, type, timestamp || new Date()]
    );
    res.status(201).json(resLog.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record glucose log.' });
  }
});

app.post('/api/v1/profiles/:profileId/assessments', authenticateToken, async (req, res) => {
  const { status, riskLevel, risks, justification, predictedHbA1c, predictedGlucose, actionPlan, recommendations, bmi } = req.body;
  try {
    const resAssess = await pool.query(
      `INSERT INTO assessment_results 
       (profile_id, status, risk_level, risks, justification, predicted_hba1c, predicted_glucose, action_plan, recommendations, bmi) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.params.profileId, status, riskLevel, risks, justification, predictedHbA1c, predictedGlucose, actionPlan, recommendations, bmi]
    );
    res.status(201).json(resAssess.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save health assessment.' });
  }
});

app.listen(PORT, () => console.log(`Diabetes Hub API listening on port ${PORT}`));
