const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tìm kiếm khách hàng theo SĐT (Yêu cầu đăng nhập)
router.get('/search', verifyToken, customerController.searchCustomerByPhone);

module.exports = router;
