const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getStudentProfile,
  updateStudentProfile,
  uploadDocument,
  uploadProfileImage,
  changeEmail,
  deactivateAccount,
  getAccountInfo,
  getDocuments,
  deleteDocument,
} = require('../controllers/Student');

// Profile routes
router.get('/profile', auth, getStudentProfile);
router.put('/profile', auth, updateStudentProfile);

// Upload routes
router.post('/upload-document', auth, uploadDocument);
router.post('/upload-image', auth, uploadProfileImage);

// Document routes
router.get('/documents', auth, getDocuments);
router.delete('/documents/delete/:documentId', auth, deleteDocument);

// Account settings routes
router.put('/change-email', auth, changeEmail);
router.put('/deactivate', auth, deactivateAccount);
router.get('/account-info', auth, getAccountInfo);

module.exports = router;
