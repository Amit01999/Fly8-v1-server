// routes/referralRoutes.js
const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

router.post('/search', referralController.searchReferral);

module.exports = router;
