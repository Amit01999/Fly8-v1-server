/**
 * ================================================
 * STUDENT NOTIFICATION CONTROLLER
 * ================================================
 * Handles student-side notification operations
 */

const Notification = require('../models/Notification');
const Student = require('../models/Student');

/**
 * Get all notifications for a student
 * @route GET /api/v1/student/notifications
 * @access Private (Student only)
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      status,
      type,
      priority,
      page = 1,
      limit = 20,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {
      recipient: studentId,
      recipientModel: 'student'
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Filter out expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1, priority: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recipient', 'firstName lastName email image');

    const totalNotifications = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalNotifications / parseInt(limit));

    return res.status(200).json({
      success: true,
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalNotifications,
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

/**
 * Get notification by ID
 * @route GET /api/v1/student/notifications/:id
 * @access Private (Student only)
 */
exports.getNotificationById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: studentId
    }).populate('recipient', 'firstName lastName email image');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 * @route PUT /api/v1/student/notifications/:id/read
 * @access Private (Student only)
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: studentId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.status === 'read') {
      return res.status(200).json({
        success: true,
        message: 'Notification already marked as read'
      });
    }

    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(studentId).emit('notification-read', {
      notificationId: notification._id,
      readAt: notification.readAt
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipient', 'firstName lastName email image');

    return res.status(200).json({
      success: true,
      notification: populatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/v1/student/notifications/read-all
 * @access Private (Student only)
 */
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await Notification.updateMany(
      {
        recipient: studentId,
        status: 'unread'
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
};

/**
 * Delete notification
 * @route DELETE /api/v1/student/notifications/:id
 * @access Private (Student only)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: studentId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

/**
 * Get notification statistics for student
 * @route GET /api/v1/student/notifications/stats
 * @access Private (Student only)
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const total = await Notification.countDocuments({
      recipient: studentId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    const unread = await Notification.countDocuments({
      recipient: studentId,
      status: 'unread',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    // Count by type
    const byType = {};
    const types = ['info', 'success', 'warning', 'error', 'appointment', 'message', 'system', 'application', 'offer'];

    for (const type of types) {
      byType[type] = await Notification.countDocuments({
        recipient: studentId,
        type,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });
    }

    // Count by priority
    const byPriority = {};
    const priorities = ['low', 'medium', 'high', 'urgent'];

    for (const priority of priorities) {
      byPriority[priority] = await Notification.countDocuments({
        recipient: studentId,
        priority,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });
    }

    // Today's notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Notification.countDocuments({
      recipient: studentId,
      createdAt: { $gte: today }
    });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        unread,
        byType,
        byPriority,
        todayCount
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * Archive notification
 * @route PUT /api/v1/student/notifications/:id/archive
 * @access Private (Student only)
 */
exports.archiveNotification = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: studentId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.status = 'archived';
    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipient', 'firstName lastName email image');

    return res.status(200).json({
      success: true,
      notification: populatedNotification,
      message: 'Notification archived successfully'
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error archiving notification',
      error: error.message
    });
  }
};
