const express = require('express');
const router = express.Router();

// Import middlewares
const { auth, isAdmin, hasPermission } = require('../middlewares/auth');

// Import controllers
const {
  adminLogin,
  adminSignup,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require('../controllers/AdminAuth');

const {
  getAllStudents,
  getStudentById,
  updateStudent,
  updateStudentProfile,
  deleteStudent,
  permanentlyDeleteStudent,
  restoreStudent,
  getStudentStats,
  updateStudentStatus,
} = require('../controllers/AdminStudent');

const {
  getAllConversations,
  getConversationMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getMessageStats,
  searchMessages,
} = require('../controllers/AdminMessage');

const {
  getAdminNotifications,
  sendNotificationToStudent,
  sendBulkNotifications,
  sendNotificationToAll,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  getStudentNotifications,
} = require('../controllers/AdminNotification');

const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment,
  getAppointmentStats,
  getTodayAppointments,
} = require('../controllers/AdminAppointment');

const {
  getAllFeedback,
  getFeedbackById,
  getStudentFeedback,
  respondToFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats,
  getUnrespondedFeedback,
  toggleFeedbackVisibility,
} = require('../controllers/AdminFeedback');

// ============================================
// ADMIN AUTHENTICATION ROUTES (PUBLIC)
// ============================================

router.post('/auth/login', adminLogin);
router.post('/auth/signup', adminSignup); // Can be protected later for super-admin only

// ============================================
// ADMIN PROFILE ROUTES (PROTECTED)
// ============================================

router.get('/profile', auth, isAdmin, getAdminProfile);
router.put('/profile', auth, isAdmin, updateAdminProfile);
router.put('/profile/password', auth, isAdmin, changeAdminPassword);

// ============================================
// STUDENT MANAGEMENT ROUTES (PROTECTED)
// ============================================

router.get('/students', auth, isAdmin, hasPermission('students', 'view'), getAllStudents);
router.get('/students/stats', auth, isAdmin, hasPermission('students', 'view'), getStudentStats);
router.get('/students/:id', auth, isAdmin, hasPermission('students', 'view'), getStudentById);
router.put('/students/:id', auth, isAdmin, hasPermission('students', 'edit'), updateStudent);
router.put('/students/:id/profile', auth, isAdmin, hasPermission('students', 'edit'), updateStudentProfile);
router.put('/students/:id/status', auth, isAdmin, hasPermission('students', 'edit'), updateStudentStatus);
router.delete('/students/:id', auth, isAdmin, hasPermission('students', 'delete'), deleteStudent);
router.delete('/students/:id/permanent', auth, isAdmin, hasPermission('students', 'delete'), permanentlyDeleteStudent);
router.post('/students/:id/restore', auth, isAdmin, hasPermission('students', 'edit'), restoreStudent);

// ============================================
// MESSAGE MANAGEMENT ROUTES (PROTECTED)
// ============================================

router.get('/messages/conversations', auth, isAdmin, hasPermission('messages', 'view'), getAllConversations);
router.get('/messages/stats', auth, isAdmin, hasPermission('messages', 'view'), getMessageStats);
router.get('/messages/search', auth, isAdmin, hasPermission('messages', 'view'), searchMessages);
router.get('/messages/:conversationId', auth, isAdmin, hasPermission('messages', 'view'), getConversationMessages);
router.post('/messages/send', auth, isAdmin, hasPermission('messages', 'send'), sendMessage);
router.put('/messages/:messageId/read', auth, isAdmin, markMessageAsRead);
router.delete('/messages/:messageId', auth, isAdmin, hasPermission('messages', 'delete'), deleteMessage);

// ============================================
// NOTIFICATION MANAGEMENT ROUTES (PROTECTED)
// ============================================

router.get('/notifications', auth, isAdmin, hasPermission('notifications', 'view'), getAdminNotifications);
router.get('/notifications/stats', auth, isAdmin, hasPermission('notifications', 'view'), getNotificationStats);
router.get('/notifications/student/:studentId', auth, isAdmin, hasPermission('notifications', 'view'), getStudentNotifications);
router.post('/notifications/send', auth, isAdmin, hasPermission('notifications', 'send'), sendNotificationToStudent);
router.post('/notifications/send-bulk', auth, isAdmin, hasPermission('notifications', 'send'), sendBulkNotifications);
router.post('/notifications/send-all', auth, isAdmin, hasPermission('notifications', 'send'), sendNotificationToAll);
router.put('/notifications/:id/read', auth, isAdmin, markNotificationAsRead);
router.put('/notifications/mark-all-read', auth, isAdmin, markAllAsRead);
router.delete('/notifications/:id', auth, isAdmin, hasPermission('notifications', 'delete'), deleteNotification);

// ============================================
// APPOINTMENT MANAGEMENT ROUTES (PROTECTED)
// ============================================

router.get('/appointments', auth, isAdmin, hasPermission('appointments', 'view'), getAllAppointments);
router.get('/appointments/stats', auth, isAdmin, hasPermission('appointments', 'view'), getAppointmentStats);
router.get('/appointments/today', auth, isAdmin, hasPermission('appointments', 'view'), getTodayAppointments);
router.get('/appointments/:id', auth, isAdmin, hasPermission('appointments', 'view'), getAppointmentById);
router.post('/appointments', auth, isAdmin, hasPermission('appointments', 'create'), createAppointment);
router.put('/appointments/:id', auth, isAdmin, hasPermission('appointments', 'edit'), updateAppointment);
router.put('/appointments/:id/status', auth, isAdmin, hasPermission('appointments', 'edit'), updateAppointmentStatus);
router.put('/appointments/:id/cancel', auth, isAdmin, hasPermission('appointments', 'edit'), cancelAppointment);
router.delete('/appointments/:id', auth, isAdmin, hasPermission('appointments', 'delete'), deleteAppointment);

// ============================================
// FEEDBACK MANAGEMENT ROUTES (PROTECTED)
// ============================================

router.get('/feedback', auth, isAdmin, hasPermission('feedback', 'view'), getAllFeedback);
router.get('/feedback/stats', auth, isAdmin, hasPermission('feedback', 'view'), getFeedbackStats);
router.get('/feedback/unresponded', auth, isAdmin, hasPermission('feedback', 'view'), getUnrespondedFeedback);
router.get('/feedback/student/:studentId', auth, isAdmin, hasPermission('feedback', 'view'), getStudentFeedback);
router.get('/feedback/:id', auth, isAdmin, hasPermission('feedback', 'view'), getFeedbackById);
router.post('/feedback/:id/respond', auth, isAdmin, hasPermission('feedback', 'respond'), respondToFeedback);
router.put('/feedback/:id/status', auth, isAdmin, hasPermission('feedback', 'respond'), updateFeedbackStatus);
router.put('/feedback/:id/visibility', auth, isAdmin, hasPermission('feedback', 'respond'), toggleFeedbackVisibility);
router.delete('/feedback/:id', auth, isAdmin, hasPermission('feedback', 'respond'), deleteFeedback);

module.exports = router;
