const express = require('express');
const {
  register,
  getRegistration,
  checkExisting,
  collectTicket,
  getAllRegistrations,
  getStatistics,
} = require('../controllers/GstuRegistrationController');

const router = express.Router();

router.post('/register', register);
router.get('/register/:registrationNumber', getRegistration);
router.post('/check-existing', checkExisting);
router.put('/collect-ticket/:registrationNumber', collectTicket);
router.get('/registrations', getAllRegistrations);
router.get('/statistics', getStatistics);

module.exports = router;
