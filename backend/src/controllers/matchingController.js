/**
 * matchingController.js
 * ----------------------
 * Handles all AI matching API endpoints:
 *  POST /api/ai/parse-resume    — upload PDF, get structured profile
 *  POST /api/ai/match-jobs      — match profile against list of jobs
 *  POST /api/ai/match-single    — match profile against one job
 *  GET  /api/ai/health          — service health check
 */

const { parseResume } = require('../services/resumeParserService');
const { matchCandidateToJobs, matchCandidateToJob } = require('../services/aiMatchingService');

// ── POST /api/ai/parse-resume ──────────────────────────────────────────────
/**
 * Accepts a PDF file upload, extracts and parses it into
 * a structured candidate profile returned as JSON.
 *
 * Expects: multipart/form-data with field "resume" (PDF file)
 * Returns: { success: true, profile: { skills, experience, ... } }
 */
async function parseResumeHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded. Send a PDF as multipart field "resume".' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, error: 'Only PDF files are accepted.' });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
    }

    const profile = await parseResume(req.file.buffer);

    return res.json({
      success: true,
      profile,
      message: `Parsed successfully. Found ${profile.skills.length} skills.`,
    });
  } catch (err) {
    console.error('parseResume error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to parse resume.' });
  }
}

// ── POST /api/ai/match-jobs ────────────────────────────────────────────────
/**
 * Match a candidate profile against an array of jobs.
 *
 * Body: {
 *   profile: { skills, rawText, ... },   ← from parse-resume
 *   jobs: [{ id, title, description, skills_required, ... }]
 * }
 * Returns: { success: true, matches: [ { jobId, matchScore, ... } ] }
 */
async function matchJobsHandler(req, res) {
  try {
    const { profile, jobs } = req.body;

    if (!profile || !profile.skills) {
      return res.status(400).json({ success: false, error: 'Missing candidate profile. Parse a resume first.' });
    }
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide a non-empty "jobs" array.' });
    }
    if (jobs.length > 50) {
      return res.status(400).json({ success: false, error: 'Maximum 50 jobs per request.' });
    }

    const matches = await matchCandidateToJobs(profile, jobs);

    return res.json({ success: true, matches });
  } catch (err) {
    console.error('matchJobs error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to match jobs. Please try again.' });
  }
}

// ── POST /api/ai/match-single ──────────────────────────────────────────────
/**
 * Match a candidate profile against a single job.
 * Used on Job Detail page for detailed analysis.
 *
 * Body: { profile: {...}, job: { id, title, ... } }
 * Returns: { success: true, match: { matchScore, strengths, ... } }
 */
async function matchSingleHandler(req, res) {
  try {
    const { profile, job } = req.body;

    if (!profile || !profile.skills) {
      return res.status(400).json({ success: false, error: 'Missing candidate profile.' });
    }
    if (!job || !job.id) {
      return res.status(400).json({ success: false, error: 'Missing job data.' });
    }

    const match = await matchCandidateToJob(profile, job);

    return res.json({ success: true, match });
  } catch (err) {
    console.error('matchSingle error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to analyze match. Please try again.' });
  }
}

// ── GET /api/ai/health ─────────────────────────────────────────────────────
function healthHandler(req, res) {
  return res.json({
    success: true,
    service: 'HireOnyx AI Matching',
    model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324',
    openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { parseResumeHandler, matchJobsHandler, matchSingleHandler, healthHandler };
