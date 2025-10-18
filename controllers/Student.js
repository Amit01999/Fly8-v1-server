const Student = require('../models/Student');
const Profile = require('../models/Profile');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const bcrypt = require('bcrypt');

// Get student profile with populated additionalDetails
exports.getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student and populate the profile
    const student = await Student.findById(userId)
      .populate('additionalDetails')
      .select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student profile fetched successfully',
      data: {
        student,
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching student profile',
      error: error.message,
    });
  }
};

// Update student profile (both Student and Profile models)
exports.updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      referral,
      additionalDetails,
    } = req.body;

    // Find student
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Update student basic info
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (email) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (country !== undefined) student.country = country;
    if (referral !== undefined) student.referral = referral;

    await student.save();

    // Update profile/additionalDetails if provided
    if (additionalDetails && student.additionalDetails) {
      const profile = await Profile.findById(student.additionalDetails);

      if (profile) {
        // Update all profile fields
        if (additionalDetails.age !== undefined) profile.age = additionalDetails.age;
        if (additionalDetails.currentEducationLevel)
          profile.currentEducationLevel = additionalDetails.currentEducationLevel;
        if (additionalDetails.fieldOfStudy !== undefined)
          profile.fieldOfStudy = additionalDetails.fieldOfStudy;
        if (additionalDetails.gpa !== undefined) profile.gpa = additionalDetails.gpa;
        if (additionalDetails.graduationYear !== undefined)
          profile.graduationYear = additionalDetails.graduationYear;
        if (additionalDetails.institution !== undefined)
          profile.institution = additionalDetails.institution;
        if (additionalDetails.ielts !== undefined) profile.ielts = additionalDetails.ielts;
        if (additionalDetails.toefl !== undefined) profile.toefl = additionalDetails.toefl;
        if (additionalDetails.gre !== undefined) profile.gre = additionalDetails.gre;
        if (additionalDetails.preferredCountries !== undefined)
          profile.preferredCountries = additionalDetails.preferredCountries;
        if (additionalDetails.preferredDegreeLevel)
          profile.preferredDegreeLevel = additionalDetails.preferredDegreeLevel;
        if (additionalDetails.budget !== undefined)
          profile.budget = additionalDetails.budget;
        if (additionalDetails.careerGoals !== undefined)
          profile.careerGoals = additionalDetails.careerGoals;
        if (additionalDetails.industry) profile.industry = additionalDetails.industry;
        if (additionalDetails.workLocation)
          profile.workLocation = additionalDetails.workLocation;

        await profile.save();
      }
    }

    // Fetch updated student with populated profile
    const updatedStudent = await Student.findById(userId)
      .populate('additionalDetails')
      .select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        student: updatedStudent,
      },
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message,
    });
  }
};

// Upload document (transcripts, resume, etc.)
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType } = req.body;

    // Validate document type
    const validDocTypes = [
      'transcripts',
      'testScores',
      'sop',
      'recommendation',
      'resume',
      'passport',
    ];

    if (!validDocTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type',
      });
    }

    // Check if file is uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const file = req.files.file;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit',
      });
    }

    // Upload to Cloudinary
    const uploadedFile = await uploadImageToCloudinary(
      file,
      `fly8/students/${userId}/documents`
    );

    // Find student and update profile
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const profile = await Profile.findById(student.additionalDetails);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Update the specific document field
    profile[documentType] = uploadedFile.secure_url;
    await profile.save();

    // Fetch updated student
    const updatedStudent = await Student.findById(userId)
      .populate('additionalDetails')
      .select('-password');

    return res.status(200).json({
      success: true,
      message: `${documentType} uploaded successfully`,
      data: {
        student: updatedStudent,
        fileUrl: uploadedFile.secure_url,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message,
    });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file is uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const file = req.files.file;

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed (JPEG, PNG, GIF)',
      });
    }

    // Validate file size (5MB max for images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds 5MB limit',
      });
    }

    // Upload to Cloudinary with optimization
    const uploadedImage = await uploadImageToCloudinary(
      file,
      `fly8/students/${userId}/profile`,
      500, // height
      90 // quality
    );

    // Update student image
    const student = await Student.findByIdAndUpdate(
      userId,
      { image: uploadedImage.secure_url },
      { new: true }
    )
      .populate('additionalDetails')
      .select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        student,
        imageUrl: uploadedImage.secure_url,
      },
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile image',
      error: error.message,
    });
  }
};

// Change email
exports.changeEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail, password } = req.body;

    // Validate input
    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'New email and password are required',
      });
    }

    // Find student
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    // Check if email is already in use
    const existingStudent = await Student.findOne({ email: newEmail });
    if (existingStudent && existingStudent._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    // Update email
    student.email = newEmail;
    await student.save();

    const updatedStudent = await Student.findById(userId)
      .populate('additionalDetails')
      .select('-password');

    return res.status(200).json({
      success: true,
      message: 'Email changed successfully. Please log in again.',
      data: {
        student: updatedStudent,
      },
    });
  } catch (error) {
    console.error('Error changing email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error changing email',
      error: error.message,
    });
  }
};

// Deactivate account
exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and update student
    const student = await Student.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
      data: {
        student,
      },
    });
  } catch (error) {
    console.error('Error deactivating account:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deactivating account',
      error: error.message,
    });
  }
};

// Get account information
exports.getAccountInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student
    const student = await Student.findById(userId).select(
      'createdAt updatedAt active approved email'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account info fetched successfully',
      data: {
        createdAt: student.createdAt,
        lastLogin: student.updatedAt, // Can be enhanced with a separate lastLogin field
        active: student.active,
        approved: student.approved,
      },
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching account info',
      error: error.message,
    });
  }
};
