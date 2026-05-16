/**
 * aiMatchingService.js
 * --------------------
 * Handles AI-powered job matching using the OpenRouter API
 * (DeepSeek model). Combines keyword overlap scoring with
 * AI reasoning for a final weighted match score.
 *
 * Caching: results are stored in a Node.js Map keyed by
 * `${resumeHash}::${jobId}` to avoid redundant API calls.
 */

const crypto = require('crypto');

// ── In-memory cache ────────────────────────────────────────────────────────
// Key: `${resumeHash}::${jobId}`, Value: match result object
const matchCache = new Map();
const MAX_CACHE_SIZE = 500; // evict oldest when full

function getCacheKey(resumeHash, jobId) {
  return `${resumeHash}::${jobId}`;
}

function hashResume(parsedProfile) {
  const str = JSON.stringify(parsedProfile.skills) + parsedProfile.rawText?.slice(0, 200);
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

function setCache(key, value) {
  if (matchCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    matchCache.delete(matchCache.keys().next().value);
  }
  matchCache.set(key, value);
}

// ── Keyword overlap scorer (fast, no API) ──────────────────────────────────
/**
 * Compute 0-100 score based on skill overlap between candidate and job.
 * Weight: 40% of final score.
 */
function keywordScore(candidateSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 50;
  if (!candidateSkills || candidateSkills.length === 0) return 0;

  const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const matched = jobSkills.filter((s) => candidateSet.has(s.toLowerCase()));
  return Math.round((matched.length / jobSkills.length) * 100);
}

// ── OpenRouter AI call ─────────────────────────────────────────────────────
/**
 * Call OpenRouter with DeepSeek to get a structured match analysis.
 * Returns parsed JSON or null on failure.
 */
async function callOpenRouter(candidateProfile, job) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324';

  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const prompt = `You are an expert technical recruiter and ATS system.

Analyze how well this candidate matches the job. Return ONLY valid JSON — no markdown, no explanation.

Required JSON structure:
{
  "aiScore": <integer 0-100>,
  "strengths": [<up to 3 short strings>],
  "missingSkills": [<up to 4 short strings>],
  "recommendation": "<one sentence, max 120 chars>",
  "reason": "<two sentences explaining the match, max 200 chars>"
}

CANDIDATE PROFILE:
Skills: ${candidateProfile.skills?.join(', ') || 'Not specified'}
Experience: ${candidateProfile.yearsExperience ? candidateProfile.yearsExperience + ' years' : 'Not specified'}
Education: ${candidateProfile.education?.join(', ') || 'Not specified'}
Role interests: ${candidateProfile.roleInterests?.join(', ') || 'Not specified'}

RESUME EXCERPT:
${(candidateProfile.rawText || '').slice(0, 2500)}

JOB:
Title: ${job.title}
Company: ${job.company}
Type: ${job.type}
Location: ${job.location}
Description: ${(job.description || '').slice(0, 1000)}
Requirements: ${(job.requirements || '').slice(0, 500)}
Required Skills: ${Array.isArray(job.skills_required) ? job.skills_required.join(', ') : ''}`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hireonyx-frontend.vercel.app',
      'X-Title': 'HireOnyx',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';

  // Strip markdown code fences if present
  const clean = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  // Parse JSON
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned non-JSON response');
  return JSON.parse(jsonMatch[0]);
}

// ── Main matching function ─────────────────────────────────────────────────
/**
 * Generate a full match result for a candidate against a single job.
 *
 * Scoring formula:
 *   finalScore = 0.40 * keywordScore + 0.60 * aiScore
 *
 * @param {object} candidateProfile - Parsed resume profile
 * @param {object} job             - Job object from Supabase
 * @returns {Promise<object>}      - Full match result
 */
async function matchCandidateToJob(candidateProfile, job) {
  const resumeHash = hashResume(candidateProfile);
  const cacheKey = getCacheKey(resumeHash, job.id);

  // Return cached result if available
  if (matchCache.has(cacheKey)) {
    return { ...matchCache.get(cacheKey), fromCache: true };
  }

  // 1. Fast keyword score (40% weight)
  const kwScore = keywordScore(candidateProfile.skills, job.skills_required);

  let aiResult = null;
  let aiScore = kwScore; // fallback if AI call fails

  // 2. AI reasoning score (60% weight) — with graceful fallback
  try {
    aiResult = await callOpenRouter(candidateProfile, job);
    aiScore = typeof aiResult.aiScore === 'number' ? aiResult.aiScore : kwScore;
  } catch (err) {
    console.warn(`AI match failed for job ${job.id}: ${err.message}`);
    // Fallback: use keyword score only
  }

  // 3. Weighted final score
  const finalScore = Math.round(0.4 * kwScore + 0.6 * aiScore);

  const result = {
    jobId: job.id,
    matchScore: Math.min(100, Math.max(0, finalScore)),
    keywordScore: kwScore,
    aiScore,
    strengths: aiResult?.strengths || [],
    missingSkills: aiResult?.missingSkills || [],
    recommendation: aiResult?.recommendation || '',
    reason: aiResult?.reason || '',
    aiAvailable: !!aiResult,
    matchedAt: new Date().toISOString(),
  };

  // Cache the result
  setCache(cacheKey, result);

  return result;
}

/**
 * Match a candidate against multiple jobs in parallel (max 5 concurrent).
 * Returns array of match results sorted by matchScore descending.
 */
async function matchCandidateToJobs(candidateProfile, jobs) {
  if (!jobs || jobs.length === 0) return [];

  // Process in batches of 5 to avoid rate limiting
  const BATCH_SIZE = 5;
  const results = [];

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((job) => matchCandidateToJob(candidateProfile, job))
    );
    batchResults.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        // Fallback result for failed jobs
        const job = batch[idx];
        const kwScore = keywordScore(candidateProfile.skills, job.skills_required);
        results.push({
          jobId: job.id,
          matchScore: kwScore,
          keywordScore: kwScore,
          aiScore: null,
          strengths: [],
          missingSkills: [],
          recommendation: '',
          reason: '',
          aiAvailable: false,
          matchedAt: new Date().toISOString(),
        });
      }
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { matchCandidateToJob, matchCandidateToJobs, keywordScore, hashResume };
