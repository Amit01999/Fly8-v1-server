const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/Student');

exports.auth = async (req, res, next) => {
  try {
    console.log(' i am Auth middleware i am  activated');
    // Prioritize Authorization header
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // Fallback to cookie or body (optional, but keep for flexibility)
    if (!token) {
      token = req.cookies.token || req.body.token;
    }

    console.log('Extracted token:', token ? 'Found' : 'Not found');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is missing',
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decode);
      req.user = decode;
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Something went wrong while validating the token',
    });
  }
};
