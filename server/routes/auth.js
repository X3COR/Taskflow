const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check duplicate email
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length)
      return res.status(400).json({ error: 'Email already registered' });

    // Hash password and save
    const hash = await bcrypt.hash(password, 10);
    const colors = ['#e94560','#0f3460','#533483','#0a8a5c','#c4691a'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, color, created_at`,
      [name, email, hash, color]
    );

    const token = jwt.sign(rows[0], process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: rows[0], token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const { password: _, ...user } = rows[0]; // strip password from response
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  — verify token and return current user
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, color, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;