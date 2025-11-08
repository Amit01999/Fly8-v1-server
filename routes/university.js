const express = require('express');
const router = express.Router();

const {
  createUniversity,
  getAllUniversities,
  getUniversityById,
  getUniversityByCode,
  updateUniversity,
  updateUniversityByCode,
  deleteUniversity,
  deleteUniversityByCode,
  getUniversitiesByCountry,
  getUniversityStats,
} = require('../controllers/University');

// CREATE
router.post('/universities', createUniversity);

// READ - Get all universities (with optional filters and pagination)
router.get('/universities', getAllUniversities);

// READ - Get statistics
router.get('/universities/stats', getUniversityStats);

// READ - Get universities by country
router.get('/universities/country/:country', getUniversitiesByCountry);

// READ - Get single university by code
router.get('/universities/code/:universitycode', getUniversityByCode);

// READ - Get single university by ID
router.get('/universities/:id', getUniversityById);

// UPDATE - Update by ID
router.put('/universities/:id', updateUniversity);

// UPDATE - Update by code
router.put('/universities/code/:universitycode', updateUniversityByCode);

// DELETE - Delete by ID
router.delete('/universities/:id', deleteUniversity);

// DELETE - Delete by code
router.delete('/universities/code/:universitycode', deleteUniversityByCode);

module.exports = router;
