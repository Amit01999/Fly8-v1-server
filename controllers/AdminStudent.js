const Student = require('../models/Student');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

// Get all students with pagination, search, and filters
exports.getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      country = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status === 'active') {
      query.active = true;
    } else if (status === 'inactive') {
      query.active = false;
    }

    // Filter by country
    if (country) {
      query.country = country;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Get students with profile details
    const students = await Student.find(query)
      .select('-password')
      .populate({
        path: 'additionalDetails',
        select: '-__v',
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    // Calculate profile completion for each student
    const studentsWithCompletion = students.map((student) => {
      const profile = student.additionalDetails;
      let completedFields = 0;
      const totalFields = 15; // Adjust based on your profile schema

      if (profile) {
        if (profile.age) completedFields++;
        if (profile.currentEducationLevel) completedFields++;
        if (profile.fieldOfStudy) completedFields++;
        if (profile.institution) completedFields++;
        if (profile.gpa) completedFields++;
        if (profile.graduationYear) completedFields++;
        if (profile.preferredCountries?.length > 0) completedFields++;
        if (profile.preferredDegreeLevel) completedFields++;
        if (profile.budget) completedFields++;
        if (profile.careerGoals) completedFields++;
        if (profile.industry) completedFields++;
        if (profile.workLocation) completedFields++;
        if (profile.ielts || profile.toefl || profile.gre) completedFields++;
        if (profile.transcripts) completedFields++;
        if (profile.passport) completedFields++;
      }

      const completionPercentage = Math.round(
        (completedFields / totalFields) * 100
      );

      return {
        ...student.toObject(),
        profileCompletion: completionPercentage,
      };
    });

    res.status(200).json({
      success: true,
      students: studentsWithCompletion,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// Get single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .select('-password')
      .populate('additionalDetails');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Calculate profile completion
    const profile = student.additionalDetails;
    let completedFields = 0;
    const totalFields = 15;

    if (profile) {
      if (profile.age) completedFields++;
      if (profile.currentEducationLevel) completedFields++;
      if (profile.fieldOfStudy) completedFields++;
      if (profile.institution) completedFields++;
      if (profile.gpa) completedFields++;
      if (profile.graduationYear) completedFields++;
      if (profile.preferredCountries?.length > 0) completedFields++;
      if (profile.preferredDegreeLevel) completedFields++;
      if (profile.budget) completedFields++;
      if (profile.careerGoals) completedFields++;
      if (profile.industry) completedFields++;
      if (profile.workLocation) completedFields++;
      if (profile.ielts || profile.toefl || profile.gre) completedFields++;
      if (profile.transcripts) completedFields++;
      if (profile.passport) completedFields++;
    }

    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100
    );

    res.status(200).json({
      success: true,
      student: {
        ...student.toObject(),
        profileCompletion: completionPercentage,
      },
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

// Update student details
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.email; // Email should be updated through a separate verified flow

    const student = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('additionalDetails');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Create notification for student
    await Notification.create({
      recipient: student._id,
      recipientModel: 'student',
      title: 'Profile Updated',
      message: 'Your profile has been updated by an administrator.',
      type: 'info',
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student,
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
};

// Update student profile (additionalDetails)
exports.updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profileUpdates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      student.additionalDetails,
      profileUpdates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Create notification for student
    await Notification.create({
      recipient: student._id,
      recipientModel: 'student',
      title: 'Profile Assessment Updated',
      message: 'Your profile assessment has been updated by an administrator.',
      type: 'info',
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// Delete student (soft delete - deactivate)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
      student,
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};

// Permanently delete student (hard delete)
exports.permanentlyDeleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete associated profile
    if (student.additionalDetails) {
      await Profile.findByIdAndDelete(student.additionalDetails);
    }

    // Delete student
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Student permanently deleted',
    });
  } catch (error) {
    console.error('Permanently delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};

// Restore deactivated student
exports.restoreStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    )
      .select('-password')
      .populate('additionalDetails');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Create notification for student
    await Notification.create({
      recipient: student._id,
      recipientModel: 'student',
      title: 'Account Restored',
      message: 'Your account has been reactivated.',
      type: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Student restored successfully',
      student,
    });
  } catch (error) {
    console.error('Restore student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring student',
      error: error.message,
    });
  }
};

// Get student statistics
exports.getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ active: true });
    const inactiveStudents = await Student.countDocuments({ active: false });

    // Get students by country
    const studentsByCountry = await Student.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await Student.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get profile completion stats
    const allProfiles = await Profile.find();
    let completionRanges = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0,
    };

    allProfiles.forEach((profile) => {
      let completedFields = 0;
      const totalFields = 15;

      if (profile.age) completedFields++;
      if (profile.currentEducationLevel) completedFields++;
      if (profile.fieldOfStudy) completedFields++;
      if (profile.institution) completedFields++;
      if (profile.gpa) completedFields++;
      if (profile.graduationYear) completedFields++;
      if (profile.preferredCountries?.length > 0) completedFields++;
      if (profile.preferredDegreeLevel) completedFields++;
      if (profile.budget) completedFields++;
      if (profile.careerGoals) completedFields++;
      if (profile.industry) completedFields++;
      if (profile.workLocation) completedFields++;
      if (profile.ielts || profile.toefl || profile.gre) completedFields++;
      if (profile.transcripts) completedFields++;
      if (profile.passport) completedFields++;

      const percentage = (completedFields / totalFields) * 100;

      if (percentage <= 25) completionRanges['0-25%']++;
      else if (percentage <= 50) completionRanges['26-50%']++;
      else if (percentage <= 75) completionRanges['51-75%']++;
      else completionRanges['76-100%']++;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        recentRegistrations,
        studentsByCountry,
        profileCompletionRanges: completionRanges,
      },
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

// Update student status (active/inactive, approved/unapproved)
exports.updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active, approved } = req.body;

    const updates = {};
    if (typeof active !== 'undefined') updates.active = active;
    if (typeof approved !== 'undefined') updates.approved = approved;

    const student = await Student.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .select('-password')
      .populate('additionalDetails');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Create notification for student
    let notificationMessage = 'Your account status has been updated.';
    if (typeof active !== 'undefined') {
      notificationMessage = active
        ? 'Your account has been activated.'
        : 'Your account has been deactivated.';
    }
    if (typeof approved !== 'undefined') {
      notificationMessage = approved
        ? 'Your account has been approved.'
        : 'Your account approval has been revoked.';
    }

    await Notification.create({
      recipient: student._id,
      recipientModel: 'student',
      title: 'Account Status Update',
      message: notificationMessage,
      type: active && approved ? 'success' : 'warning',
    });

    res.status(200).json({
      success: true,
      message: 'Student status updated successfully',
      student,
    });
  } catch (error) {
    console.error('Update student status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};
