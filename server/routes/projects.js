const router = require('express').Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    // Get projects + their member ids
    const { rows } = await db.query(`
      SELECT p.*,
        COALESCE(
          json_agg(pm.user_id) FILTER (WHERE pm.user_id IS NOT NULL),
          '[]'
        ) AS member_ids
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects (admin only)
router.post('/', adminOnly, async (req, res) => {
  const client = await db.connect();
  try {
    const { name, description, color, deadline, member_ids } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name required' });

    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO projects (name, description, color, deadline, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, color || '#e94560', deadline, req.user.id]
    );

    const project = rows[0];

    // Add members
    if (member_ids && member_ids.length) {
      const values = member_ids.map((uid, i) => `($1, $${i + 2})`).join(',');
      await client.query(
        `INSERT INTO project_members (project_id, user_id) VALUES ${values}`,
        [project.id, ...member_ids]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ...project, member_ids: member_ids || [] });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/projects/:id (admin only)
router.patch('/:id', adminOnly, async (req, res) => {
  const client = await db.connect();
  try {
    const { name, description, color, deadline, member_ids } = req.body;

    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           deadline = COALESCE($4, deadline)
       WHERE id = $5 RETURNING *`,
      [name, description, color, deadline, req.params.id]
    );

    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }

    if (member_ids) {
      await client.query('DELETE FROM project_members WHERE project_id = $1', [req.params.id]);
      if (member_ids.length) {
        const values = member_ids.map((uid, i) => `($1, $${i + 2})`).join(',');
        await client.query(
          `INSERT INTO project_members (project_id, user_id) VALUES ${values}`,
          [req.params.id, ...member_ids]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ ...rows[0], member_ids: member_ids || [] });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/projects/:id (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;