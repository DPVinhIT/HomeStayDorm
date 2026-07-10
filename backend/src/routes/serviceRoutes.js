const express = require('express');
const router = express.Router();
const ServiceController  = require('../controllers/serviceController');

// Tuyến đường 1: GET /api/services
router.get('/', ServiceController.getAllServices);

// Tuyến đường 2: GET /api/services/contract-templates
router.get('/contract-templates', ServiceController.getContractTemplates);

module.exports = router;