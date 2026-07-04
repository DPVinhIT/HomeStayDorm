const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Vai trò đăng nhập (ví dụ Admin, Sale, Manager, Accountant)
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về access token
 *       400:
 *         description: Thiếu thông tin
 *       401:
 *         description: Sai thông tin đăng nhập
 */

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

module.exports = router;
