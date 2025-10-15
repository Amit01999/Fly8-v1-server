const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    layout: {
      type: String,
      enum: ['layout1', 'layout2', 'layout3'],
      default: 'layout1',
    },
    category: {
      type: String,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Cloudinary URL
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorImage: {
      type: String, // Cloudinary URL
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional if Fly8 has user model
    },
    date: {
      type: Date,
      default: Date.now,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
blogSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
