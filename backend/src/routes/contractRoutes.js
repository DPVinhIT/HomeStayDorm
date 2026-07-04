const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', contractController.getAllContracts);

module.exports = router;
