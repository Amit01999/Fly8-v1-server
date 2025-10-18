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
} = require('../controllers/Student');

// Profile routes
router.get('/profile', auth, getStudentProfile);
router.put('/profile', auth, updateStudentProfile);

// Upload routes
router.post('/upload-document', auth, uploadDocument);
router.post('/upload-image', auth, uploadProfileImage);

// Account settings routes
router.put('/change-email', auth, changeEmail);
router.put('/deactivate', auth, deactivateAccount);
router.get('/account-info', auth, getAccountInfo);

module.exports = router;
