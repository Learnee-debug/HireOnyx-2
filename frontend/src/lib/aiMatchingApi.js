/**
 * aiMatchingApi.js
 * ----------------
 * Frontend service layer for all AI matching API calls.
 * Keeps the backend URL in one place and provides clean
 * functions for each endpoint.
 *
 * Uses localStorage to cache parsed resume profiles so the
 * user only needs to upload once per session.
 */

const BASE = import.meta.env.VITE_BACKEND_URL;
const PROFILE_KEY = 'hireonyx_resume_profile';

// ── Resume profile (localStorage) ─────────────────────────────────────────

export function getSavedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

// ── API: parse resume ──────────────────────────────────────────────────────
/**
 * Upload a PDF File object, get back a structured candidate profile.
 * @param {File} file - PDF file from <input type="file">
 * @returns {Promise<object>} parsed profile
 */
export async function parseResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${BASE}/api/ai/parse-resume`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to parse resume');
  return json.profile;
}

// ── API: match multiple jobs ───────────────────────────────────────────────
/**
 * Match a candidate profile against an array of jobs.
 * @param {object} profile - Parsed resume profile
 * @param {Array}  jobs    - Array of job objects from Supabase
 * @returns {Promise<Array>} sorted match results
 */
export async function matchJobs(profile, jobs) {
  const res = await fetch(`${BASE}/api/ai/match-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, jobs }),
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to match jobs');
  return json.matches; // [{ jobId, matchScore, strengths, missingSkills, ... }]
}

// ── API: match single job ─────────────────────────────────────────────────
/**
 * Get a detailed match analysis for one job.
 * @param {object} profile - Parsed resume profile
 * @param {object} job     - Single job object
 * @returns {Promise<object>} detailed match result
 */
export async function matchSingleJob(profile, job) {
  const res = await fetch(`${BASE}/api/ai/match-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, job }),
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to analyze match');
  return json.match;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Build a Map<jobId → matchResult> from the matches array */
export function buildMatchMap(matches) {
  return new Map(matches.map((m) => [m.jobId, m]));
}

/** Score colour — mirrors backend matchColor logic */
export function matchColor(score) {
  if (score >= 80) return '#00C2A8'; // teal
  if (score >= 55) return '#4F8EF7'; // blue
  return '#94A3B8';                  // muted
}

export function matchGlow(score) {
  if (score >= 80) return '0 0 10px rgba(0,194,168,0.35)';
  if (score >= 55) return '0 0 10px rgba(79,142,247,0.30)';
  return 'none';
}
