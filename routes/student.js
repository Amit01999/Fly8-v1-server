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

// Import new controllers for real-time features
const StudentMessageController = require('../controllers/StudentMessage');
const StudentNotificationController = require('../controllers/StudentNotification');
const StudentAppointmentController = require('../controllers/StudentAppointment');

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

// ============================================
// MESSAGE ROUTES
// ============================================
router.get('/messages/conversations', auth, StudentMessageController.getStudentConversations);
router.get('/messages/conversation/:conversationId', auth, StudentMessageController.getConversationMessages);
router.post('/messages/send', auth, StudentMessageController.sendMessage);
router.put('/messages/:messageId/read', auth, StudentMessageController.markMessageAsRead);
router.get('/messages/stats', auth, StudentMessageController.getMessageStats);
router.delete('/messages/:messageId', auth, StudentMessageController.deleteMessage);

// ============================================
// NOTIFICATION ROUTES
// ============================================
router.get('/notifications', auth, StudentNotificationController.getMyNotifications);
router.get('/notifications/stats', auth, StudentNotificationController.getNotificationStats);
router.get('/notifications/:id', auth, StudentNotificationController.getNotificationById);
router.put('/notifications/:id/read', auth, StudentNotificationController.markNotificationAsRead);
router.put('/notifications/read-all', auth, StudentNotificationController.markAllNotificationsAsRead);
router.put('/notifications/:id/archive', auth, StudentNotificationController.archiveNotification);
router.delete('/notifications/:id', auth, StudentNotificationController.deleteNotification);

// ============================================
// APPOINTMENT ROUTES
// ============================================
router.get('/appointments', auth, StudentAppointmentController.getMyAppointments);
router.get('/appointments/stats', auth, StudentAppointmentController.getAppointmentStats);
router.get('/appointments/available-slots', auth, StudentAppointmentController.getAvailableSlots);
router.get('/appointments/:id', auth, StudentAppointmentController.getAppointmentById);
router.post('/appointments', auth, StudentAppointmentController.createAppointment);
router.put('/appointments/:id/cancel', auth, StudentAppointmentController.cancelAppointment);

module.exports = router;
