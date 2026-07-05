const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Chỉ Sale và Admin (Quản lý) mới được xem và tạo Phiếu đăng ký
router.get('/', verifyToken, authorizeRoles('SALE', 'QUAN_LY', 'ADMIN'), registrationController.getAllRegistrations);
router.post('/', verifyToken, authorizeRoles('SALE', 'QUAN_LY', 'ADMIN'), registrationController.createRegistration);

module.exports = router;
