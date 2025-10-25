const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
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
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['super-admin', 'student-admin', 'admin', 'advisor', 'support'],
      default: 'advisor',
    },
    phone: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: 'https://api.dicebear.com/5.x/initials/svg?seed=Admin',
    },
    permissions: {
      students: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      messages: {
        view: { type: Boolean, default: true },
        send: { type: Boolean, default: true },
        delete: { type: Boolean, default: false },
      },
      appointments: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: true },
        edit: { type: Boolean, default: true },
        delete: { type: Boolean, default: false },
      },
      notifications: {
        view: { type: Boolean, default: true },
        send: { type: Boolean, default: true },
        delete: { type: Boolean, default: false },
      },
      feedback: {
        view: { type: Boolean, default: true },
        respond: { type: Boolean, default: true },
      },
      analytics: {
        view: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for efficient querying
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('Admin', adminSchema);
