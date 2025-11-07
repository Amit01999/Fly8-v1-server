const express = require('express');
const multer = require('multer'); // npm i multer

const {
  createBlog,
  getPublishedBlogs,
  getBlogById,
  getAdminBlogs,
  updateBlog,
  deleteBlog,
  submitForReview,
  approveBlog,
  rejectBlog,
  uploadImage,
} = require('../controllers/BlogController');

const router = express.Router();

// Configure multer with file size limit (3MB to account for base64 encoding overhead)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit (will be ~4MB after base64 encoding)
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Routes
router.post(
  '/blogs',
  upload.fields([{ name: 'image' }, { name: 'authorImage' }]),
  createBlog
);
router.get('/blogs', getPublishedBlogs);
router.get('/blogs/admin', getAdminBlogs);
router.get('/blogs/:id', getBlogById);

router.put(
  '/blogs/:id',
  upload.fields([{ name: 'image' }, { name: 'authorImage' }]),
  updateBlog
);
router.delete('/blogs/:id', deleteBlog);
router.put('/blogs/:id/submit', submitForReview);
router.put('/blogs/:id/approve', approveBlog);
router.put('/blogs/:id/reject', rejectBlog);
router.post('/blogs/imgupload', upload.single('image'), uploadImage);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 3MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  next(error);
});

module.exports = router;
