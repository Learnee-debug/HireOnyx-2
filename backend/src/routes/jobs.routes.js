const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const jobs = require('../controllers/jobs.controller');

router.get('/mine', requireAuth, requireRole('recruiter'), jobs.mine);
router.get('/:id/applicants', requireAuth, requireRole('recruiter'), jobs.applicants);
router.get('/:id', jobs.getOne);
router.get('/', jobs.list);
router.post('/', requireAuth, requireRole('recruiter'), jobs.create);
router.patch('/:id', requireAuth, requireRole('recruiter'), jobs.update);

module.exports = router;
