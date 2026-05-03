const router = require('express').Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin
      ? 'SELECT * FROM tasks ORDER BY created_at DESC'
      : 'SELECT * FROM tasks WHERE assignee_id = $1 OR created_by = $1 ORDER BY created_at DESC';
    const params = isAdmin ? [] : [req.user.id];
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, project_id, assignee_id, status, priority, due_date } = req.body;
    if (!title || !project_id || !due_date)
      return res.status(400).json({ error: 'title, project_id, due_date are required' });

    const { rows } = await db.query(
      `INSERT INTO tasks (title, project_id, assignee_id, created_by, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, project_id, assignee_id || req.user.id, req.user.id,
       status || 'todo', priority || 'med', due_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    // Fetch the task first to check ownership
    const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Task not found' });

    const task = existing.rows[0];
    const isAdmin = req.user.role === 'admin';
    const isOwner = task.assignee_id === req.user.id || task.created_by === req.user.id;

    if (!isAdmin && !isOwner)
      return res.status(403).json({ error: 'Not authorized to edit this task' });

    const { title, status, priority, due_date, assignee_id } = req.body;

    const { rows } = await db.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           status      = COALESCE($2, status),
           priority    = COALESCE($3, priority),
           due_date    = COALESCE($4, due_date),
           assignee_id = COALESCE($5, assignee_id)
       WHERE id = $6 RETURNING *`,
      [title, status, priority, due_date, assignee_id, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;