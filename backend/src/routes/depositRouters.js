const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', authorizeRoles('MANAGER', 'ADMIN', 'SALE'), depositController.getAlldeposit);
router.get('/:id', authorizeRoles('MANAGER', 'ADMIN', 'SALE'), depositController.getDepositById);
router.post('/', authorizeRoles('MANAGER', 'ADMIN', 'SALE'), depositController.createDeposit);
router.patch('/:id/status', authorizeRoles('MANAGER', 'ADMIN'), depositController.updateDepositStatus);

module.exports = router;