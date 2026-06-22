const pool = require('../db/pool');

exports.create = async (req, res) => {
  const { job_id, cover_letter, resume_text } = req.body;
  if (!job_id || !resume_text?.trim()) {
    return res.status(400).json({ success: false, error: 'Resume text is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO applications (job_id, seeker_id, cover_letter, resume_text, status)
       VALUES ($1, $2, $3, $4, 'applied')
       RETURNING *`,
      [job_id, req.user.id, cover_letter || null, resume_text]
    );
    return res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: "You've already applied to this job." });
    }
    console.error('Create application error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to submit application.' });
  }
};

exports.mine = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, json_build_object('title', j.title, 'company', j.company, 'type', j.type, 'location', j.location) AS jobs
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.seeker_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, applications: result.rows });
  } catch (err) {
    console.error('My applications error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
};

exports.checkOne = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND seeker_id = $2',
      [req.params.jobId, req.user.id]
    );
    return res.json({ success: true, application: result.rows[0] || null });
  } catch (err) {
    console.error('Check application error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to check application.' });
  }
};

exports.recruiterAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, json_build_object('full_name', p.full_name, 'email', p.email) AS profiles, j.title AS job_title
       FROM applications a
       JOIN profiles p ON p.id = a.seeker_id
       JOIN jobs j ON j.id = a.job_id
       WHERE j.recruiter_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, applications: result.rows });
  } catch (err) {
    console.error('Recruiter applications error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch candidates.' });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!['applied', 'reviewing', 'selected', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status.' });
  }

  try {
    const result = await pool.query(
      `UPDATE applications a SET status = $1
       WHERE a.id = $2
         AND a.job_id IN (SELECT id FROM jobs WHERE recruiter_id = $3)
       RETURNING a.*`,
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found or not yours to update.' });
    }
    return res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('Update application status error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
};
