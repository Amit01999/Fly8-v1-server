const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'student',
      required: false,
    },
    age: {
      type: Number,
      min: 0,
    },
    currentEducationLevel: {
      type: String,
      enum: ['bachelor', 'master', 'phd', 'diploma', 'other'],
    },
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    gpa: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 10,
    },
    institution: {
      type: String,
      trim: true,
    },
    ielts: {
      type: String,
      trim: true,
    },
    toefl: {
      type: String,
      trim: true,
    },
    gre: {
      type: String,
      trim: true,
    },
    preferredCountries: {
      type: [String],
      default: [],
    },
    preferredDegreeLevel: {
      type: String,
      enum: ['bachelor', 'master', 'phd', 'other'],
    },
    budget: {
      type: String,
      trim: true,
    },
    careerGoals: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      enum: [
        'tech',
        'finance',
        'healthcare',
        'education',
        'consulting',
        'other',
      ],
    },
    workLocation: {
      type: String,
      enum: ['home-country', 'study-country', 'global', 'other'],
    },
    // Document file paths (stored after upload, e.g., via multer to a folder or cloud)
    transcripts: {
      type: String, // e.g., '/uploads/studentId/transcripts.pdf'
    },
    testScores: {
      type: String,
    },
    sop: {
      type: String,
    },
    recommendation: {
      type: String,
    },
    resume: {
      type: String,
    },
    passport: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
