const Notification = require('../models/Notification');
const Student = require('../models/Student');

// Get all notifications for admin
exports.getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', type = 'all' } = req.query;
    const adminId = req.user.id;

    const query = {
      recipient: adminId,
      recipientModel: 'Admin',
    };

    if (status !== 'all') {
      query.status = status;
    }

    if (type !== 'all') {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// Send notification to a single student
exports.sendNotificationToStudent = async (req, res) => {
  try {
    const { studentId, title, message, type = 'info', priority = 'medium', link, metadata } = req.body;

    if (!studentId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, title, and message are required',
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const notification = await Notification.create({
      recipient: studentId,
      recipientModel: 'student',
      title,
      message,
      type,
      priority,
      link,
      metadata,
    });

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(studentId).emit('new-notification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      notification,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message,
    });
  }
};

// Send notification to multiple students
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { studentIds, title, message, type = 'info', priority = 'medium', link, metadata } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required',
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    // Create notifications for all students
    const notifications = studentIds.map((studentId) => ({
      recipient: studentId,
      recipientModel: 'student',
      title,
      message,
      type,
      priority,
      link,
      metadata,
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Emit socket events for real-time updates
    if (req.io) {
      studentIds.forEach((studentId, index) => {
        req.io.to(studentId).emit('new-notification', createdNotifications[index]);
      });
    }

    res.status(201).json({
      success: true,
      message: `Notifications sent to ${studentIds.length} students`,
      count: createdNotifications.length,
    });
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending bulk notifications',
      error: error.message,
    });
  }
};

// Send notification to all students
exports.sendNotificationToAll = async (req, res) => {
  try {
    const { title, message, type = 'info', priority = 'medium', link, metadata } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    // Get all active students
    const students = await Student.find({ active: true }).select('_id');
    const studentIds = students.map((s) => s._id);

    if (studentIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active students found',
      });
    }

    // Create notifications for all students
    const notifications = studentIds.map((studentId) => ({
      recipient: studentId,
      recipientModel: 'student',
      title,
      message,
      type,
      priority,
      link,
      metadata,
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Emit socket events for real-time updates
    if (req.io) {
      req.io.emit('broadcast-notification', createdNotifications[0]);
    }

    res.status(201).json({
      success: true,
      message: `Notification sent to all ${studentIds.length} active students`,
      count: createdNotifications.length,
    });
  } catch (error) {
    console.error('Send notification to all error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notifications',
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        status: 'read',
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message,
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const adminId = req.user.id;

    const result = await Notification.updateMany(
      {
        recipient: adminId,
        recipientModel: 'Admin',
        status: 'unread',
      },
      {
        status: 'read',
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message,
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const totalSent = await Notification.countDocuments({
      recipientModel: 'student',
    });

    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const sentLast24Hours = await Notification.countDocuments({
      recipientModel: 'student',
      createdAt: { $gte: last24Hours },
    });

    const readRate = await Notification.aggregate([
      { $match: { recipientModel: 'student' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          read: {
            $sum: {
              $cond: [{ $eq: ['$status', 'read'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const notificationsByType = await Notification.aggregate([
      { $match: { recipientModel: 'student' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const readPercentage =
      readRate.length > 0 ? (readRate[0].read / readRate[0].total) * 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalSent,
        sentLast24Hours,
        readPercentage: Math.round(readPercentage),
        notificationsByType,
      },
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics',
      error: error.message,
    });
  }
};

// Get notification history for a specific student
exports.getStudentNotifications = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({
      recipient: studentId,
      recipientModel: 'student',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({
      recipient: studentId,
      recipientModel: 'student',
    });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get student notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student notifications',
      error: error.message,
    });
  }
};
