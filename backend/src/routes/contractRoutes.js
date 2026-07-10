const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', contractController.getAllContracts);
// Route xử lý tạo hợp đồng (Giới hạn quyền cho Sale, Quản lý)
router.post('/', verifyToken, authorizeRoles('SALE', 'QUAN_LY'), contractController.createContract);
module.exports = router;
