const express = require('express');
const orderController = require('../controllers/orderController');
const { orderLimiter, trackingLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/', orderLimiter, orderController.create);
router.get('/:id', trackingLimiter, orderController.getById);

module.exports = router;
