const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const applications = require('../controllers/applications.controller');

router.get('/mine', requireAuth, requireRole('seeker'), applications.mine);
router.get('/check/:jobId', requireAuth, requireRole('seeker'), applications.checkOne);
router.get('/recruiter', requireAuth, requireRole('recruiter'), applications.recruiterAll);
router.post('/', requireAuth, requireRole('seeker'), applications.create);
router.patch('/:id', requireAuth, requireRole('recruiter'), applications.updateStatus);

module.exports = router;
