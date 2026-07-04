const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/available', verifyToken, roomController.getAvailableRooms);
router.get('/', verifyToken, roomController.getAllRooms);

module.exports = router;
