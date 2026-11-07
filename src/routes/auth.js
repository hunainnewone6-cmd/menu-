const express = require('express');
const authController = require('../controllers/authController');
const { loginLimiter, totpLimiter } = require('../middleware/rateLimiters');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginLimiter, authController.login);
router.post('/verify-2fa', totpLimiter, authController.verify2FA);

router.get('/me', requireAdmin, authController.me);
router.post('/2fa/enroll', requireAdmin, authController.enrollStart);
router.post('/2fa/confirm', requireAdmin, authController.enrollConfirm);
router.post('/2fa/disable', requireAdmin, authController.disable);

module.exports = router;
