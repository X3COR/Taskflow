const router = require('express').Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // all user routes require login

// GET /api/users — list all users
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, color, created_at FROM users ORDER BY created_at'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/role — change role (admin only)
router.patch('/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role))
      return res.status(400).json({ error: 'Role must be admin or member' });

    // Prevent last admin from being demoted
    if (role === 'member') {
      const { rows } = await db.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin'"
      );
      if (parseInt(rows[0].count) <= 1)
        return res.status(400).json({ error: 'Cannot remove the last admin' });
    }

    const { rows } = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;