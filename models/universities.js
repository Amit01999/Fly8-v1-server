const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UniversitySchema = new Schema(
  {
    universitycode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    campusName: {
      type: String,
    },
    tagline: {
      type: String,
    },
    stats: [{ type: String }],
    description: {
      type: String,
    },
    overviewData: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    generalInfo: {
      type: String,
    },
    applicationFee: {
      type: Number,
      default: 0,
    },
    financialRequirement: {
      type: Number,
    },
    tuitionDeposit: {
      type: Number,
      default: 0,
    },
    processingFee: {
      type: Number,
      default: 0,
    },
    generalRequirements: [{ type: String }],
    undergraduate: {
      englishTests: [
        {
          name: { type: String },
          score: { type: String },
        },
      ],
      otherTests: [{ type: String }],
      additionalRequirements: [{ type: String }],
    },
    graduate: {
      englishTests: [
        {
          name: { type: String },
          score: { type: String },
        },
      ],
      additionalRequirements: [{ type: String }],
    },
    conditionalAdmission: {
      available: {
        type: Boolean,
        default: false,
      },
      description: { type: String },
      benefits: [{ type: String }],
    },
    tuitionData: [
      {
        category: { type: String },
        amount: { type: String },
        period: { type: String },
      },
    ],
    additionalFees: [
      {
        name: { type: String },
        amount: { type: String },
      },
    ],
    livingCosts: [
      {
        category: { type: String },
        range: { type: String },
      },
    ],
    scholarships: [
      {
        name: { type: String },
        amount: { type: String },
        type: { type: String },
        eligibility: { type: String },
        renewable: { type: Boolean },
        popular: { type: Boolean },
      },
    ],
    visaSteps: [
      {
        step: { type: Number },
        title: { type: String },
        description: { type: String },
      },
    ],
    workOpportunities: [
      {
        type: { type: String },
        description: { type: String },
        timing: { type: String },
      },
    ],
    campusImages: [
      {
        src: { type: String },
        alt: { type: String },
      },
    ],
    campusFeatures: [
      {
        title: { type: String },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const University = mongoose.model('University', UniversitySchema);

module.exports = University;
