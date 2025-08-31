const Profile = require('../models/Profile');
const Student = require('../models/Student'); // Assuming the model is named 'student'
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', req.user.id); // Assume req.user.id from auth middleware
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const docType = file.fieldname; // 'files' but we map based on originalname or something; adjust if needed
    cb(null, `${docType}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Unsupported file type'));
  },
}).array('files', 6); // Up to 6 files

// Controller for submitting assessment form data
const submitAssessment = async (req, res) => {
  try {
    console.log('Assessment submission body:', req.body);
    const studentId = req.user.id; // From JWT middleware
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    let profile = await Profile.findOne({ student: studentId });
    if (!profile) {
      profile = new Profile({ student: studentId });
    }

    // Extract nested form data
    const { personalInfo, academics, preferences, goals } = req.body;

    // Map to Profile schema fields with validation
    profile.age = personalInfo?.age
      ? parseInt(personalInfo.age, 10)
      : undefined;
    profile.currentEducationLevel = academics?.currentEducation || undefined;
    profile.fieldOfStudy = academics?.fieldOfStudy?.trim() || undefined;
    profile.gpa = academics?.gpa?.trim() || undefined;
    profile.graduationYear = academics?.graduationYear
      ? parseInt(academics.graduationYear, 10)
      : undefined;
    profile.institution = academics?.institution?.trim() || undefined;
    profile.ielts = academics?.ielts?.trim() || undefined;
    profile.toefl = academics?.toefl?.trim() || undefined;
    profile.gre = academics?.gre?.trim() || undefined;
    profile.preferredCountries = preferences?.preferredCountries || [];
    profile.preferredDegreeLevel =
      preferences?.preferredDegreeLevel || undefined;
    profile.budget = preferences?.budget?.trim() || undefined;
    profile.careerGoals = goals?.careerGoals?.trim() || undefined;
    profile.industry = goals?.industry || undefined;
    profile.workLocation = goals?.workLocation || undefined;

    // Validate fields against schema constraints
    if (profile.age && profile.age < 0) {
      return res.status(400).json({
        success: false,
        message: 'Age must be non-negative',
      });
    }
    if (profile.graduationYear) {
      const currentYear = new Date().getFullYear();
      if (
        profile.graduationYear < 1900 ||
        profile.graduationYear > currentYear + 10
      ) {
        return res.status(400).json({
          success: false,
          message: `Graduation year must be between 1900 and ${
            currentYear + 10
          }`,
        });
      }
    }
    if (
      profile.currentEducationLevel &&
      !['bachelor', 'master', 'phd', 'diploma', 'other'].includes(
        profile.currentEducationLevel
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid education level',
      });
    }
    if (
      profile.preferredDegreeLevel &&
      !['bachelor', 'master', 'phd', 'other'].includes(
        profile.preferredDegreeLevel
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferred degree level',
      });
    }
    if (
      profile.industry &&
      ![
        'tech',
        'finance',
        'healthcare',
        'education',
        'consulting',
        'other',
      ].includes(profile.industry)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid industry',
      });
    }
    if (
      profile.workLocation &&
      !['home-country', 'study-country', 'global', 'other'].includes(
        profile.workLocation
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid work location',
      });
    }

    await profile.save();

    // Update student's additionalDetails if not set
    if (!student.additionalDetails) {
      student.additionalDetails = profile._id;
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      profile,
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
// Controller for uploading documents
const uploadDocuments = (req, res) => {
  upload(req, res, async err => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const studentId = req.user.id; // Authenticated user ID
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      let profile = await Profile.findOne({ student: studentId });
      if (!profile) {
        profile = new Profile({ student: studentId });
      }

      // Map uploaded files to profile fields based on filename prefix (e.g., transcripts_file.pdf)
      req.files.forEach(file => {
        const docType = file.originalname.split('_')[0]; // Assuming frontend prefixes like 'transcripts_filename.ext'
        const filePath = `/uploads/${studentId}/${file.filename}`;

        switch (docType) {
          case 'transcripts':
            profile.transcripts = filePath;
            break;
          case 'testScores':
            profile.testScores = filePath;
            break;
          case 'sop':
            profile.sop = filePath;
            break;
          case 'recommendation':
            profile.recommendation = filePath;
            break;
          case 'resume':
            profile.resume = filePath;
            break;
          case 'passport':
            profile.passport = filePath;
            break;
          default:
            // Optional: handle unknown types
            break;
        }
      });

      await profile.save();

      // Update student's additionalDetails if not set
      if (!student.additionalDetails) {
        student.additionalDetails = profile._id;
        await student.save();
      }

      res
        .status(200)
        .json({ message: 'Documents uploaded successfully', profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};
module.exports = { submitAssessment, uploadDocuments };
