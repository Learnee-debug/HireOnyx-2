const router = require('express').Router();
const { analyzeResume } = require('../controllers/ai.controller');

router.post('/analyze-resume', analyzeResume);

module.exports = router;
