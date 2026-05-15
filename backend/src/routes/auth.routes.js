const router = require('express').Router();
const { signup } = require('../controllers/auth.controller');

router.post('/signup', signup);

module.exports = router;
