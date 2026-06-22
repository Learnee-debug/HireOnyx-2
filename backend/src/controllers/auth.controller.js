const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

function issueToken(profile) {
  return jwt.sign(
    { id: profile.id, email: profile.email, role: profile.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.signup = async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  if (!['seeker', 'recruiter'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash]
    );
    const userId = userResult.rows[0].id;

    const profileResult = await client.query(
      `INSERT INTO profiles (id, full_name, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [userId, fullName, email, role]
    );

    await client.query('COMMIT');

    const profile = profileResult.rows[0];
    return res.json({ success: true, token: issueToken(profile), profile });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Signup error:', err.message);
    return res.status(500).json({ success: false, error: 'Signup failed. Please try again.' });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const userResult = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const profileResult = await pool.query(
      'SELECT id, full_name, email, role FROM profiles WHERE id = $1',
      [user.id]
    );
    const profile = profileResult.rows[0];

    return res.json({ success: true, token: issueToken(profile), profile });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

exports.me = async (req, res) => {
  try {
    const profileResult = await pool.query(
      'SELECT id, full_name, email, role, avatar_url, bio, skills, location, company_name FROM profiles WHERE id = $1',
      [req.user.id]
    );
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }
    return res.json({ success: true, profile: profileResult.rows[0] });
  } catch (err) {
    console.error('Me error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
};
