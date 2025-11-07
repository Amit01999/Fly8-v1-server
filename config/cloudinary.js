const cloudinary = require('cloudinary').v2;

const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      timeout: 120000 // 2 minutes timeout for all operations
    });

    console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

    // Test if credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('WARNING: Cloudinary credentials are missing in environment variables');
    }
  } catch (error) {
    console.error('Error configuring Cloudinary:', error);
  }
};

module.exports = { cloudinary, cloudinaryConnect };
