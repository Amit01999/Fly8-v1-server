const express = require('express');
const router = express.Router();

const {
  createProgram,
  getAllPrograms,
  getProgramById,
  getProgramsByCountry,
  getProgramsByUniversity,
  getProgramsByLevel,
  updateProgram,
  deleteProgram,
  getProgramStats,
} = require('../controllers/Program');

// CREATE
router.post('/programs', createProgram);

// READ - Get all programs (with optional filters and pagination)
router.get('/programs', getAllPrograms);

// READ - Get statistics
router.get('/programs/stats', getProgramStats);

// READ - Get programs by country
router.get('/programs/country/:country', getProgramsByCountry);

// READ - Get programs by university
router.get('/programs/university/:universityName', getProgramsByUniversity);

// READ - Get programs by level
router.get('/programs/level/:level', getProgramsByLevel);

// READ - Get single program by ID
router.get('/programs/:id', getProgramById);

// UPDATE - Update by ID
router.put('/programs/:id', updateProgram);

// DELETE - Delete by ID
router.delete('/programs/:id', deleteProgram);

module.exports = router;
