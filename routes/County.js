const express = require('express');
const router = express.Router();
const { getCountryDetails } = require('../controllers/Country');

router.get('/getCountryDetails', getCountryDetails);

module.exports = router;
