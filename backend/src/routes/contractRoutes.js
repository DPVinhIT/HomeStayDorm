const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

/**
 * @swagger
 * /api/contracts/registrations:
 *   get:
 *     summary: Lấy danh sách phiếu đăng ký thuê
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng kết quả mỗi trang
 *     responses:
 *       200:
 *         description: Trả về danh sách phiếu đăng ký
 *       401:
 *         description: Chưa xác thực
 */
router.get('/registrations', contractController.getAllRegistrations);

router.get('/', contractController.getAllContracts);

module.exports = router;
