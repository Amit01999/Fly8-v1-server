const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');
const { body, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify'); // For server-side HTML sanitization (install via npm i isomorphic-dompurify)

// Helper to sanitize HTML
const sanitizeContent = content => DOMPurify.sanitize(content);

// Upload to Cloudinary
const uploadToCloudinary = async file => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: 'image', folder: 'fly8-blogs' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      )
      .end(file.buffer);
  });
};

// Validation middleware (can be chained in routes)
const validateBlog = [
  body('title').trim().notEmpty().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be between 1-200 characters'),
  body('authorName').trim().notEmpty().isLength({ min: 1, max: 100 }).withMessage('Author name is required and must be between 1-100 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  body('layout').optional().isIn(['layout1', 'layout2', 'layout3']).withMessage('Invalid layout'),
  body('image').optional().trim(),
  body('authorImage').optional().trim(),
];

// CREATE
exports.createBlog = [
  validateBlog,
  async (req, res) => {
    try {
      console.log('Create blog endpoint hit');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);

      const errors = validationResult(req);
      console.log('Validation Errors:', errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        title,
        content,
        authorName,
        excerpt,
        category,
        layout,
        saveAsDraft,
        image,
        authorImage,
      } = req.body;

      const status = saveAsDraft === 'true' || saveAsDraft === true ? 'draft' : 'pending';

      // Sanitize content
      const sanitizedContent = sanitizeContent(content);

      // Handle image uploads - support both file upload and URL string
      let imageUrl = image; // Use URL from body if provided
      let authorImageUrl = authorImage; // Use URL from body if provided

      // Override with uploaded files if present
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          imageUrl = await uploadToCloudinary(req.files.image[0]);
        }
        if (req.files.authorImage && req.files.authorImage[0]) {
          authorImageUrl = await uploadToCloudinary(req.files.authorImage[0]);
        }
      }

      const blogData = {
        title,
        content: sanitizedContent,
        authorName,
        status,
      };

      // Add optional fields only if they exist
      if (excerpt) blogData.excerpt = excerpt;
      if (category) blogData.category = category;
      if (layout) blogData.layout = layout;
      if (imageUrl) blogData.image = imageUrl;
      if (authorImageUrl) blogData.authorImage = authorImageUrl;

      const blog = new Blog(blogData);
      await blog.save();

      console.log('Blog created successfully:', blog._id);
      res.status(201).json({
        success: true,
        blog
      });
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
];

// FETCH PUBLIC (published only)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .populate('createdBy', 'name');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH SINGLE (published or admin/owner)
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'createdBy',
      'name'
    );
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH ADMIN (all blogs, filterable)
exports.getAdminBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const blogs = await Blog.find(filter)
      .sort({ date: -1 })
      .populate('createdBy', 'name');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateBlog = [
  validateBlog,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ error: 'Blog not found' });

      // Update fields
      Object.assign(blog, {
        ...req.body,
        content: sanitizeContent(req.body.content),
      });

      // Handle image uploads from multer
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          blog.image = await uploadToCloudinary(req.files.image[0]);
        }
        if (req.files.authorImage && req.files.authorImage[0]) {
          blog.authorImage = await uploadToCloudinary(req.files.authorImage[0]);
        }
      }

      await blog.save();
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// DELETE
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUBMIT FOR REVIEW
exports.submitForReview = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.status !== 'draft')
      return res.status(400).json({ error: 'Invalid blog or status' });

    blog.status = 'pending';
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// APPROVE
exports.approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.status !== 'pending')
      return res.status(400).json({ error: 'Invalid blog or status' });

    blog.status = 'published';
    blog.publishedAt = new Date();
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REJECT
exports.rejectBlog = async (req, res) => {
  try {
    const { reason } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.status !== 'pending')
      return res.status(400).json({ error: 'Invalid blog or status' });

    blog.status = 'rejected';
    if (reason) blog.excerpt = `${blog.excerpt || ''} [Rejected: ${reason}]`; // Append reason to excerpt for visibility
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPLOAD IMAGE
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const url = await uploadToCloudinary(req.file);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
