import express from 'express';
import {
  getProfile,
  addOrUpdateAcademicInfo,
  addOrUpdateStudyPreferences,
  uploadDocument,
  addCourse,
  addNotification,
  addMessage,
  addAppointment,
  updatePersonalInformation,
} from './profile.controller';

const router = express.Router();

router.get('/profile/:studentId', getProfile);
router.put('/profile/:studentId/academic-info', addOrUpdateAcademicInfo);
router.put(
  '/profile/:studentId/study-preferences',
  addOrUpdateStudyPreferences
);
router.post(
  '/profile/:studentId/documents',
  upload.single('file'),
  uploadDocument
);
router.post('/profile/:studentId/courses', addCourse);
router.post('/profile/:studentId/notifications', addNotification);
router.post('/profile/:studentId/messages', addMessage);
router.post('/profile/:studentId/appointments', addAppointment);
router.put('/student/:studentId/personal', updatePersonalInformation);
export default router;
