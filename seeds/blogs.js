const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// Placeholder Cloudinary URLs (replace with real uploads)
const sampleImage =
  'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/fly8-blogs/placeholder.jpg';
const sampleAuthorImage =
  'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/fly8-blogs/author-placeholder.jpg';

const sampleBlogs = [
  {
    title: 'Welcome to Fly8: First Flight',
    layout: 'layout1',
    category: 'Introduction',
    excerpt: 'Discover the skies with Fly8.',
    content:
      '<p>Rich content here... <strong>Exciting!</strong></p><img src="https://example.com/img.jpg" alt="Sky view">',
    image: sampleImage,
    authorName: 'Jane Doe',
    authorImage: sampleAuthorImage,
    status: 'published',
    publishedAt: new Date(),
    createdBy: null, // Optional
  },
  {
    title: 'Aviation Tips for Beginners',
    layout: 'layout2',
    category: 'Tips',
    excerpt: 'Essential advice for new pilots.',
    content: '<h2>Getting Started</h2><p>Learn the basics...</p>',
    image: sampleImage,
    authorName: 'John Smith',
    authorImage: sampleAuthorImage,
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000), // Yesterday
    createdBy: null,
  },
  {
    title: 'Advanced Maneuvers',
    layout: 'layout3',
    category: 'Advanced',
    excerpt: 'Master the skies.',
    content: '<p>Advanced content...</p>',
    image: sampleImage,
    authorName: 'Alice Johnson',
    authorImage: sampleAuthorImage,
    status: 'published',
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    createdBy: null,
  },
];

const seedBlogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // From Fly8 .env
    await Blog.deleteMany({});
    await Blog.insertMany(sampleBlogs);
    console.log('Sample blogs seeded!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedBlogs();
