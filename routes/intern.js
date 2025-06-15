const express = require('express');
const {
  submitInternApplication,
} = require('../controllers/InternController.js');

const router = express.Router();

router.post('/apply', submitInternApplication);

module.exports = router;
