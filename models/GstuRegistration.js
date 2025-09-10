const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String },
    dateOfBirth: { type: String },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    universityName: { type: String, required: true },
    department: { type: String, required: true },
    currentYear: { type: String },
    studentId: { type: String, required: true },
    studyDestinations: { type: [String], required: true },
    programLevel: { type: String, required: true },
    areasOfInterest: { type: [String], required: true },
    otherDestination: { type: String },
    otherArea: { type: String },
    hasPassport: { type: String, required: true },
    hasLanguageTest: { type: String, required: true },
    languageTestName: { type: String },
    languageTestScore: { type: String },
    appliedAbroad: { type: String, required: true },
    expectations: { type: String, required: true },
    consent: { type: Boolean, required: true },
    registrationNumber: { type: String, unique: true, required: true },
    registrationDate: { type: Date, default: Date.now },
    ticketCollected: { type: Boolean, default: false },
    ticketCollectionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
