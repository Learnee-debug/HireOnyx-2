const pool = require('../db/pool');

exports.list = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE is_active = true ORDER BY created_at DESC'
    );
    return res.json({ success: true, jobs: result.rows });
  } catch (err) {
    console.error('List jobs error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch jobs.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found.' });
    }
    return res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    console.error('Get job error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch job.' });
  }
};

exports.mine = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COALESCE(COUNT(a.id), 0)::int AS application_count
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.recruiter_id = $1
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, jobs: result.rows });
  } catch (err) {
    console.error('My jobs error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch your jobs.' });
  }
};

exports.create = async (req, res) => {
  const { title, company, location, type, description, requirements, skills_required, salary_min, salary_max } = req.body;

  if (!title || !company || !location || !type || !description || !requirements) {
    return res.status(400).json({ success: false, error: 'Missing required job fields.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO jobs (title, company, location, type, description, requirements, skills_required, salary_min, salary_max, recruiter_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
      [title, company, location, type, description, requirements, skills_required || [], salary_min || null, salary_max || null, req.user.id]
    );
    return res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    console.error('Create job error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to post job.' });
  }
};

exports.update = async (req, res) => {
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE jobs SET is_active = $1 WHERE id = $2 AND recruiter_id = $3 RETURNING *',
      [is_active, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found or not yours.' });
    }
    return res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    console.error('Update job error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update job.' });
  }
};

exports.applicants = async (req, res) => {
  try {
    const jobResult = await pool.query('SELECT recruiter_id FROM jobs WHERE id = $1', [req.params.id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found.' });
    }
    if (jobResult.rows[0].recruiter_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not your job.' });
    }

    const result = await pool.query(
      `SELECT a.*, json_build_object('full_name', p.full_name, 'email', p.email) AS profiles
       FROM applications a
       JOIN profiles p ON p.id = a.seeker_id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC`,
      [req.params.id]
    );
    return res.json({ success: true, applicants: result.rows });
  } catch (err) {
    console.error('Applicants error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch applicants.' });
  }
};
