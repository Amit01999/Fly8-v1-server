const express = require('express');
const router = express.Router();
const { submitAssessment, uploadDocuments } = require('../controllers/Profile');
const { auth } = require('../middlewares/auth');

// POST /api/assessment - Submit assessment form
router.post('/assessment', auth, submitAssessment);

// POST /api/upload-documents - Upload documents
router.post('/upload-documents', auth, uploadDocuments);

module.exports = router;
