const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    programName: {
      type: String,
      required: true,
      trim: true,
    },
    majors: {
      type: String,
      required: true,
      trim: true,
    },
    programLevel: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Undergraduate Program',
        'Graduate Program',
        'Postgraduate Program',
        'Diploma',
        'Certificate',
        'Doctoral Program',
      ],
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    intake: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional fields
    languageRequirement: {
      ielts: {
        type: String,
        trim: true,
      },
      toefl: {
        type: String,
        trim: true,
      },
      pte: {
        type: String,
        trim: true,
      },
      duolingo: {
        type: String,
        trim: true,
      },
    },
    programMode: {
      type: String,
      trim: true,
      enum: ['On-campus', 'Online', 'Hybrid', 'Distance Learning'],
    },
    scholarship: {
      type: String,
      trim: true,
    },
    applicationFee: {
      type: String,
      trim: true,
    },
    tuitionFee: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for better query performance
ProgramSchema.index({ country: 1 });
ProgramSchema.index({ universityName: 1 });
ProgramSchema.index({ programLevel: 1 });
ProgramSchema.index({ majors: 1 });
ProgramSchema.index({ programName: 'text', majors: 'text' }); // Text search index

module.exports = mongoose.model('Program', ProgramSchema);
