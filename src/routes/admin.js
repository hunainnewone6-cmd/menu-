const express = require('express');
const orderController = require('../controllers/orderController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/orders', orderController.listForAdmin);
router.patch('/orders/:id/status', orderController.updateStatus);
router.get('/orders/export.csv', orderController.exportCsv);

module.exports = router;
