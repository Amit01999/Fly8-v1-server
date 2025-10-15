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
const upload = multer({ storage: multer.memoryStorage() });

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

module.exports = router;
