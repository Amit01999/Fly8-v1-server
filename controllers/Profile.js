const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const Student = require('./student.model');
const Profile = require('./profile.model');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Calculate profile completion
const calculateCompletionPercentage = profile => {
  let totalFields = 0;
  let filledFields = 0;

  const academicInfoFields = [
    profile.academicInfo.highestEducation,
    profile.academicInfo.institutionName,
    profile.academicInfo.fieldOfStudy,
    profile.academicInfo.graduationYear,
    profile.academicInfo.gpa,
    profile.academicInfo.gradeSystem,
  ];
  totalFields += academicInfoFields.length;
  filledFields += academicInfoFields.filter(v => v && v.trim() !== '').length;

  const preferenceFields = [
    profile.studyPreferences.preferredCountries.length > 0,
    profile.studyPreferences.preferredPrograms.length > 0,
    profile.studyPreferences.studyLevel,
    profile.studyPreferences.intakePreference.length > 0,
    profile.studyPreferences.budgetRange,
    profile.studyPreferences.accommodation,
  ];
  totalFields += preferenceFields.length;
  filledFields += preferenceFields.filter(v => v).length;

  const requiredDocs = [
    'Passport',
    'Academic Transcripts',
    'English Proficiency Test Results',
  ];
  totalFields += requiredDocs.length;
  filledFields += requiredDocs.filter(docType =>
    profile.documents.some(doc => doc.type === docType)
  ).length;

  return Math.round((filledFields / totalFields) * 100);
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      studentId: req.params.studentId,
    }).populate('studentId');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// add or update personal info

const updatePersonalInformation = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const updates = req.body;

    const student = await Student.findByIdAndUpdate(studentId, updates, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Personal information updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add or update academic info
const addOrUpdateAcademicInfo = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    profile.academicInfo = { ...profile.academicInfo, ...req.body };
    profile.completionPercentage = calculateCompletionPercentage(profile);
    await profile.save();

    res.json({
      message: profile.academicInfo.highestEducation
        ? 'Academic info updated'
        : 'Academic info added',
      completionPercentage: profile.completionPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add or update study preferences
const addOrUpdateStudyPreferences = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    profile.studyPreferences = { ...profile.studyPreferences, ...req.body };
    profile.completionPercentage = calculateCompletionPercentage(profile);
    await profile.save();

    res.json({
      message:
        profile.studyPreferences.preferredCountries.length > 0
          ? 'Study preferences updated'
          : 'Study preferences added',
      completionPercentage: profile.completionPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    const document = {
      id: uuidv4(),
      type,
      fileName: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    profile.documents.push(document);
    profile.completionPercentage = calculateCompletionPercentage(profile);
    await profile.save();

    res.json({ message: 'Document uploaded', document });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add course
const addCourse = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    const { title, status, progress } = req.body;
    const course = { id: uuidv4(), title, status, progress: Number(progress) };
    profile.courses.push(course);
    await profile.save();

    res.json({ message: 'Course added', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add notification
const addNotification = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    const { message } = req.body;
    const notification = { id: uuidv4(), message, read: false };
    profile.notifications.push(notification);
    await profile.save();

    res.json({ message: 'Notification added', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add message
const addMessage = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    const { sender, content } = req.body;
    const message = { id: uuidv4(), sender, content };
    profile.messages.push(message);
    await profile.save();

    res.json({ message: 'Message added', message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add appointment
const addAppointment = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let profile = await Profile.findOne({ studentId: student._id });
    if (!profile) {
      profile = await Profile.create({ studentId: student._id });
    }

    const { title, date, status } = req.body;
    const appointment = { id: uuidv4(), title, date: new Date(date), status };
    profile.appointments.push(appointment);
    await profile.save();

    res.json({ message: 'Appointment added', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Export all handlers
module.exports = {
  updatePersonalInformation,
  upload,
  calculateCompletionPercentage,
  getProfile,
  addOrUpdateAcademicInfo,
  addOrUpdateStudyPreferences,
  uploadDocument,
  addCourse,
  addNotification,
  addMessage,
  addAppointment,
};
