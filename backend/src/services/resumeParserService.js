/**
 * resumeParserService.js
 * ----------------------
 * Extracts raw text from a PDF buffer using pdf-parse,
 * then structures it into a clean candidate profile object
 * that can be sent to the AI matching service.
 */

const pdfParse = require('pdf-parse');

/**
 * Extract plain text from a PDF buffer.
 * @param {Buffer} buffer - Raw PDF bytes
 * @returns {Promise<string>} Plain text content
 */
async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text || '';
}

/**
 * Parse a block of text into a structured candidate profile.
 * Uses lightweight heuristics — fast, no AI call needed here.
 *
 * @param {string} text - Raw resume text
 * @returns {object} Structured profile
 */
function parseResumeText(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // ── Skills extraction ──────────────────────────────────────
  // Common tech keywords to look for (extend as needed)
  const TECH_KEYWORDS = [
    'JavaScript','TypeScript','Python','Java','Go','Rust','C++','C#','Ruby','PHP','Swift','Kotlin',
    'React','Vue','Angular','Next.js','Nuxt','Svelte','Remix',
    'Node.js','Express','Fastify','Django','FastAPI','Flask','Spring','Laravel',
    'PostgreSQL','MySQL','MongoDB','Redis','SQLite','DynamoDB','Firebase',
    'GraphQL','REST','gRPC','WebSockets',
    'Docker','Kubernetes','AWS','GCP','Azure','Vercel','Railway','Netlify',
    'Git','GitHub','GitLab','CI/CD','Jenkins','GitHub Actions',
    'Tailwind','CSS','SASS','SCSS','Styled Components',
    'Redux','Zustand','MobX','React Query','SWR',
    'Jest','Vitest','Cypress','Playwright','Testing Library',
    'Figma','Photoshop','UI/UX','Design Systems',
    'SQL','NoSQL','Prisma','Sequelize','TypeORM','Mongoose',
    'Machine Learning','TensorFlow','PyTorch','Scikit-learn','NLP',
    'Linux','Bash','Shell','Nginx','Apache',
    'Supabase','PlanetScale','Neon','Hasura',
  ];

  const rawText = text.toLowerCase();
  const skills = TECH_KEYWORDS.filter((kw) =>
    rawText.includes(kw.toLowerCase())
  );

  // ── Experience extraction ──────────────────────────────────
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  const yearsExperience = expMatch ? parseInt(expMatch[1]) : null;

  // ── Education extraction ───────────────────────────────────
  const EDU_KEYWORDS = ['B.Tech','B.E','B.Sc','B.S','M.Tech','M.S','M.Sc','MBA','PhD','Bachelor','Master','Degree','Computer Science','Engineering','Information Technology'];
  const education = EDU_KEYWORDS.filter((kw) => rawText.includes(kw.toLowerCase()));

  // ── Role interests / job titles ────────────────────────────
  const ROLE_KEYWORDS = [
    'Frontend','Backend','Full Stack','Full-Stack','Mobile','iOS','Android',
    'DevOps','Cloud','Data Engineer','Data Scientist','ML Engineer',
    'Software Engineer','Software Developer','Product Manager',
    'UI/UX Designer','QA Engineer','Site Reliability','Security Engineer',
  ];
  const roleInterests = ROLE_KEYWORDS.filter((kw) =>
    rawText.includes(kw.toLowerCase())
  );

  // ── Email extraction ───────────────────────────────────────
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);

  // ── Name heuristic (first non-empty line, if short enough) ─
  const nameLine = lines.find((l) => l.length > 2 && l.length < 50 && !l.includes('@'));

  return {
    name: nameLine || 'Candidate',
    email: emailMatch ? emailMatch[0] : null,
    skills,                            // array of matched tech keywords
    yearsExperience,                   // number or null
    education,                         // array of matched edu keywords
    roleInterests,                     // array of inferred target roles
    rawText: text.slice(0, 6000),      // truncated raw text for AI prompt
    parsedAt: new Date().toISOString(),
  };
}

/**
 * Main entry point: takes a PDF buffer and returns a structured profile.
 * @param {Buffer} buffer
 * @returns {Promise<object>}
 */
async function parseResume(buffer) {
  const text = await extractTextFromPDF(buffer);
  if (!text || text.trim().length < 50) {
    throw new Error('Could not extract meaningful text from the PDF. Please upload a text-based (not scanned) PDF.');
  }
  return parseResumeText(text);
}

module.exports = { parseResume, parseResumeText, extractTextFromPDF };
