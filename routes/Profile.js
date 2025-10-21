const express = require('express');
const router = express.Router();
const { submitAssessment, uploadDocuments, getProfileCompletion } = require('../controllers/Profile');
const { auth } = require('../middlewares/auth');

// POST /api/assessment - Submit assessment form
router.post('/assessment', auth, submitAssessment);

// POST /api/upload-documents - Upload documents
router.post('/upload-documents', auth, uploadDocuments);

// GET /api/profile-completion - Get profile completion percentage
router.get('/profile-completion', auth, getProfileCompletion);

module.exports = router;
