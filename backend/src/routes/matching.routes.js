/**
 * matching.routes.js
 * ------------------
 * All AI matching endpoints:
 *
 *   GET  /api/ai/health        — confirm service is configured
 *   POST /api/ai/parse-resume  — upload PDF → get structured profile
 *   POST /api/ai/match-jobs    — profile + jobs[] → sorted match scores
 *   POST /api/ai/match-single  — profile + job  → detailed match
 */

const router = require('express').Router();
const multer = require('multer');
const {
  parseResumeHandler,
  matchJobsHandler,
  matchSingleHandler,
  healthHandler,
} = require('../controllers/matchingController');

// multer: store uploaded files in memory (no disk I/O — safe for Railway ephemeral FS)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are accepted.'));
  },
});

router.get('/health', healthHandler);
router.post('/parse-resume', upload.single('resume'), parseResumeHandler);
router.post('/match-jobs', matchJobsHandler);
router.post('/match-single', matchSingleHandler);

module.exports = router;
