const mongoose = require('mongoose');

/**
 * Schema for German Language Free Course Registration
 * Total Classes: 8
 * Start Date: 27 November, 2025
 */
const germanCourseRegistrationSchema = new mongoose.Schema(
  {
    // Full Name - Required
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // Email Address - Required & Unique
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    // WhatsApp Number - Required
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Please enter a valid phone number',
      ],
    },

    // Current Academic Level - Required
    academicLevel: {
      type: String,
      required: [true, 'Academic level is required'],
      enum: [
        'HSC / Equivalent',
        'Diploma',
        'Undergraduate',
        'Graduate',
        'Postgraduate',
        'Job Holder',
        'Other',
      ],
    },

    // Other Academic Level (if 'Other' is selected)
    otherAcademicLevel: {
      type: String,
      trim: true,
      maxlength: [100, 'Other academic level cannot exceed 100 characters'],
    },

    // Have you previously participated in Fly8 free courses? - Required
    previousFly8Course: {
      type: String,
      required: [true, 'Please indicate if you have participated in previous courses'],
      enum: [
        'Yes – IELTS Course',
        'Yes – Japanese Language Course',
        'Yes – Both',
        'No – This will be my first course',
      ],
    },

    // What's your relation with Fly8 Family? - Required
    fly8Relation: {
      type: String,
      required: [true, 'Please indicate your relation with Fly8 Family'],
      enum: ['Member', 'Intern', 'Other'],
    },

    // Other Relation (if 'Other' is selected)
    otherFly8Relation: {
      type: String,
      trim: true,
      maxlength: [100, 'Other relation cannot exceed 100 characters'],
    },

    // Auto-generated registration number (unique identifier)
    registrationNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // Registration timestamp
    registrationDate: {
      type: Date,
      default: Date.now,
    },

    // Course Details
    courseDetails: {
      totalClasses: {
        type: Number,
        default: 8,
      },
      startDate: {
        type: String,
        default: '27 November, 2025',
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Index for faster email lookups
germanCourseRegistrationSchema.index({ email: 1 });

// Index for registration number lookups
germanCourseRegistrationSchema.index({ registrationNumber: 1 });

// Pre-save middleware to validate conditional fields
germanCourseRegistrationSchema.pre('save', function (next) {
  // If academicLevel is 'Other', otherAcademicLevel must be provided
  if (this.academicLevel === 'Other' && !this.otherAcademicLevel) {
    next(new Error('Please specify your academic level'));
  }

  // If fly8Relation is 'Other', otherFly8Relation must be provided
  if (this.fly8Relation === 'Other' && !this.otherFly8Relation) {
    next(new Error('Please specify your relation with Fly8 Family'));
  }

  next();
});

module.exports = mongoose.model(
  'GermanCourseRegistration',
  germanCourseRegistrationSchema
);
