const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', checkoutController.getCheckoutRequests);

module.exports = router;
