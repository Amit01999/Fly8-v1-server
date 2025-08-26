const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
});
module.exports = mongoose.model('Profile', profileSchema);

// import mongoose, { Schema, Document } from 'mongoose';
// const ProfileSchema = new Schema({
//   studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },
//   academicInfo: {
//     highestEducation: { type: String },
//     institutionName: { type: String },
//     fieldOfStudy: { type: String },
//     graduationYear: { type: String },
//     gpa: { type: String },
//     gradeSystem: { type: String },
//     englishProficiency: { type: String },
//   },
//   studyPreferences: {
//     preferredCountries: [{ type: String }],
//     preferredPrograms: [{ type: String }],
//     studyLevel: { type: String },
//     intakePreference: [{ type: String }],
//     budgetRange: { type: String },
//     accommodation: { type: String },
//   },
//   documents: [
//     {
//       id: { type: String, required: true },
//       type: { type: String, required: true },
//       fileName: { type: String, required: true },
//       url: { type: String, required: true },
//       uploadedAt: { type: Date, default: Date.now },
//     },
//   ],
//   courses: [
//     {
//       id: { type: String, required: true },
//       title: { type: String, required: true },
//       status: { type: String, required: true },
//       progress: { type: Number, required: true },
//     },
//   ],
//   notifications: [
//     {
//       id: { type: String, required: true },
//       message: { type: String, required: true },
//       read: { type: Boolean, default: false },
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   messages: [
//     {
//       id: { type: String, required: true },
//       sender: { type: String, required: true },
//       content: { type: String, required: true },
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   appointments: [
//     {
//       id: { type: String, required: true },
//       title: { type: String, required: true },
//       date: { type: Date, required: true },
//       status: { type: String, required: true },
//     },
//   ],
//   completionPercentage: { type: Number, default: 0 },
// });

// export default mongoose.model('Profile', ProfileSchema);
