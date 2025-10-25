const Feedback = require('../models/Feedback');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Get all feedback with filters
exports.getAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      service = 'all',
      rating,
      priority = 'all',
      category = 'all',
    } = req.query;

    const query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (service !== 'all') {
      query.service = service;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (priority !== 'all') {
      query.priority = priority;
    }

    if (category !== 'all') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(query)
      .populate('student', 'firstName lastName email image')
      .populate('respondedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

// Get single feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('student', 'firstName lastName email phone image country')
      .populate('respondedBy', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

// Get feedback for a specific student
exports.getStudentFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find({ student: studentId })
      .populate('respondedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ student: studentId });

    res.status(200).json({
      success: true,
      feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get student feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student feedback',
      error: error.message,
    });
  }
};

// Respond to feedback
exports.respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response is required',
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        adminResponse: response,
        respondedBy: req.user.id,
        respondedAt: new Date(),
        status: 'in-progress',
      },
      { new: true }
    )
      .populate('student', 'firstName lastName email')
      .populate('respondedBy', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Create notification for student
    await Notification.create({
      recipient: feedback.student._id,
      recipientModel: 'student',
      title: 'Feedback Response Received',
      message: `Your feedback about "${feedback.subject}" has been responded to by our team.`,
      type: 'info',
      priority: 'medium',
      link: `/feedback/${feedback._id}`,
      metadata: { feedbackId: feedback._id },
    });

    // Emit socket event
    if (req.io) {
      req.io.to(feedback.student._id.toString()).emit('feedback-response', feedback);
    }

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      feedback,
    });
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to feedback',
      error: error.message,
    });
  }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    const feedback = await Feedback.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate('student', 'firstName lastName email')
      .populate('respondedBy', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Notify student of status change if resolved or closed
    if (status === 'resolved' || status === 'closed') {
      await Notification.create({
        recipient: feedback.student._id,
        recipientModel: 'student',
        title: 'Feedback Status Update',
        message: `Your feedback about "${feedback.subject}" has been ${status}.`,
        type: 'success',
        priority: 'low',
        link: `/feedback/${feedback._id}`,
      });

      // Emit socket event
      if (req.io) {
        req.io.to(feedback.student._id.toString()).emit('feedback-status-changed', feedback);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      feedback,
    });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status',
      error: error.message,
    });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message,
    });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const open = await Feedback.countDocuments({ status: 'open' });
    const inProgress = await Feedback.countDocuments({ status: 'in-progress' });
    const resolved = await Feedback.countDocuments({ status: 'resolved' });
    const closed = await Feedback.countDocuments({ status: 'closed' });

    // Average rating
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Feedback by service
    const feedbackByService = await Feedback.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Feedback by category
    const feedbackByCategory = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Feedback by rating
    const feedbackByRating = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    // Response rate
    const responded = await Feedback.countDocuments({
      adminResponse: { $exists: true, $ne: null },
    });
    const responseRate = total > 0 ? (responded / total) * 100 : 0;

    // Recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedback = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        averageRating:
          ratingStats.length > 0
            ? Math.round(ratingStats[0].averageRating * 10) / 10
            : 0,
        feedbackByService,
        feedbackByCategory,
        feedbackByRating,
        responseRate: Math.round(responseRate),
        recentFeedback,
      },
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message,
    });
  }
};

// Get unresponded feedback
exports.getUnrespondedFeedback = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const feedbacks = await Feedback.find({
      status: 'open',
      adminResponse: { $exists: false },
    })
      .populate('student', 'firstName lastName email image')
      .sort({ priority: -1, createdAt: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    console.error('Get unresponded feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unresponded feedback',
      error: error.message,
    });
  }
};

// Toggle feedback public visibility
exports.toggleFeedbackVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    feedback.isPublic = !feedback.isPublic;
    await feedback.save();

    res.status(200).json({
      success: true,
      message: `Feedback is now ${feedback.isPublic ? 'public' : 'private'}`,
      feedback,
    });
  } catch (error) {
    console.error('Toggle feedback visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback visibility',
      error: error.message,
    });
  }
};
