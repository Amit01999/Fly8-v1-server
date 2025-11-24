const express = require('express');
const {
  register,
  getAllRegistrations,
  getRegistrationByNumber,
  checkEmailExists,
  getStatistics,
  deleteRegistration,
} = require('../controllers/GermanCourseController');

const router = express.Router();

/**
 * @route   POST /api/german-course/register
 * @desc    Register for German Language Free Course
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   GET /api/german-course/registrations
 * @desc    Get all registrations (with pagination and search)
 * @access  Admin (should add auth middleware in production)
 */
router.get('/registrations', getAllRegistrations);

/**
 * @route   GET /api/german-course/registration/:registrationNumber
 * @desc    Get single registration by registration number
 * @access  Public
 */
router.get('/registration/:registrationNumber', getRegistrationByNumber);

/**
 * @route   POST /api/german-course/check-email
 * @desc    Check if email already exists
 * @access  Public
 */
router.post('/check-email', checkEmailExists);

/**
 * @route   GET /api/german-course/statistics
 * @desc    Get registration statistics
 * @access  Admin (should add auth middleware in production)
 */
router.get('/statistics', getStatistics);

/**
 * @route   DELETE /api/german-course/registration/:id
 * @desc    Delete a registration
 * @access  Admin (should add auth middleware in production)
 */
router.delete('/registration/:id', deleteRegistration);

module.exports = router;
