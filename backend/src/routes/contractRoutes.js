const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

/**
 * @swagger
 * /api/contracts/registrations:
 * get:
 * summary: Lấy danh sách phiếu đăng ký thuê
 * tags: [Contracts]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: page
 * schema:
 * type: integer
 * default: 1
 * description: Số trang
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 10
 * description: Số lượng kết quả mỗi trang
 * - in: query
 * name: status
 * schema:
 * type: string
 * description: 'Lọc theo trạng thái (VD: Mới, Đang xử lý, Đã duyệt, Từ chối)'
 * - in: query
 * name: roomType
 * schema:
 * type: string
 * description: Lọc theo loại phòng mong muốn
 * - in: query
 * name: search
 * schema:
 * type: string
 * description: Tìm theo tên khách hàng hoặc số điện thoại
 * responses:
 * 200:
 * description: Trả về danh sách phiếu đăng ký
 * 401:
 * description: Chưa xác thực
 */
router.get('/registrations', contractController.getAllRegistrations);

/**
 * @swagger
 * /api/contracts/registrations/{id}:
 * get:
 * summary: "Lấy chi tiết phiếu đăng ký thuê theo mã phiếu (VD: #PDK-2023-001)"
 * tags: [Contracts]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Mã phiếu đăng ký
 * responses:
 * 200:
 * description: Chi tiết phiếu đăng ký
 * 404:
 * description: Không tìm thấy
 */
router.get('/registrations/:id', contractController.getRegistrationById);

/**
 * @swagger
 * /api/contracts/registrations/{id}/status:
 * patch:
 * summary: Cập nhật trạng thái phiếu đăng ký thuê
 * tags: [Contracts]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: 'Mã phiếu đăng ký (VD: #PDK-2023-001)'
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - status
 * properties:
 * status:
 * type: string
 * description: 'Trạng thái mới (VD: Từ chối, Đã duyệt)'
 * responses:
 * 200:
 * description: Cập nhật thành công
 * 404:
 * description: Không tìm thấy phiếu đăng ký
 */
router.patch('/registrations/:id/status', contractController.updateRegistrationStatus);

router.get('/', contractController.getAllContracts);

module.exports = router;