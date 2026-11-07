const express = require('express');
const menuController = require('../controllers/menuController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', menuController.listPublic);

router.get('/admin', requireAdmin, menuController.listAdmin);
router.post('/admin', requireAdmin, menuController.create);
router.patch('/admin/:id', requireAdmin, menuController.update);

module.exports = router;
