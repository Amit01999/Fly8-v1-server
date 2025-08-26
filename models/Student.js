// const mongoose = require('mongoose');
// const studentSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },
//     phone: {
//       type: String,
//     },
//     country: {
//       type: String,
//       required: true,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//     approved: {
//       type: Boolean,
//       default: true,
//     },
//     additionalDetails: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'Profile',
//     },
//     token: {
//       type: String,
//     },
//     resetPasswordExpires: {
//       type: Date,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('student', studentSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    referral: {
      // Add optional referral field
      type: String,
      required: false,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Profile',
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('student', studentSchema);

// import mongoose, { Schema, Document } from 'mongoose';

// const StudentSchema = new Schema(
//   {
//     firstName: { type: String, required: true, trim: true },
//     lastName: { type: String, required: true, trim: true },
//     email: { type: String, required: true, trim: true },
//     password: { type: String, required: true },
//     phone: { type: String },
//     country: { type: String, required: true },
//     active: { type: Boolean, default: true },
//     approved: { type: Boolean, default: true },
//     additionalDetails: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: 'Profile',
//     },
//     token: { type: String },
//     resetPasswordExpires: { type: Date },
//     image: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Student', StudentSchema);

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const StudentSchema = new Schema(
//   {
//     firstName: { type: String, required: true, trim: true },
//     lastName: { type: String, required: true, trim: true },
//     email: { type: String, required: true, trim: true, unique: true },
//     password: { type: String, required: true },
//     phone: { type: String },
//     country: { type: String, required: true },
//     active: { type: Boolean, default: true },
//     approved: { type: Boolean, default: true },
//     additionalDetails: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: 'Profile',
//     },
//     token: { type: String },
//     resetPasswordExpires: { type: Date },
//     image: { type: String, required: true },
//     accountType: {
//       type: String,
//       enum: ['student', 'partner', 'institution', 'intern'],
//       default: 'student',
//     },
//     referralCode: { type: String, unique: true, sparse: true }, // For interns
//     referredBy: { type: Schema.Types.ObjectId, ref: 'Student' }, // For students
//     referredStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }], // List of referred students
//     studentCount: { type: Number, default: 0 }, // Count of referred students
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Student', StudentSchema);
