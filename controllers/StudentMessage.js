/**
 * ================================================
 * STUDENT MESSAGE CONTROLLER
 * ================================================
 * Handles student-side messaging operations with real-time Socket.io integration
 */

const Message = require('../models/Message');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

/**
 * Get all conversations for a student
 * @route GET /api/v1/student/messages/conversations
 * @access Private (Student only)
 */
exports.getStudentConversations = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all messages for this student
    const messages = await Message.find({
      $or: [
        { sender: studentId, senderModel: 'student' },
        { recipient: studentId, recipientModel: 'student' }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'firstName lastName email image')
    .populate('recipient', 'email firstName lastName');

    // Group by conversation and get latest message
    const conversationMap = new Map();

    for (const message of messages) {
      const conversationId = message.conversationId;

      if (!conversationMap.has(conversationId)) {
        // Count unread messages in this conversation
        const unreadCount = await Message.countDocuments({
          conversationId,
          recipient: studentId,
          status: { $ne: 'read' }
        });

        // Get admin info
        let admin = null;
        if (message.sender.toString() !== studentId) {
          admin = await Admin.findById(message.sender).select('email firstName lastName');
        } else if (message.recipient.toString() !== studentId) {
          admin = await Admin.findById(message.recipient).select('email firstName lastName');
        }

        conversationMap.set(conversationId, {
          conversationId,
          admin,
          lastMessage: message,
          unreadCount,
          updatedAt: message.createdAt
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    return res.status(200).json({
      success: true,
      conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Error fetching student conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

/**
 * Get messages for a specific conversation
 * @route GET /api/v1/student/messages/conversation/:conversationId
 * @access Private (Student only)
 */
exports.getConversationMessages = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify student is part of this conversation
    const messageCount = await Message.countDocuments({
      conversationId,
      $or: [
        { sender: studentId },
        { recipient: studentId }
      ]
    });

    if (messageCount === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this conversation'
      });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'firstName lastName email image')
      .populate('recipient', 'firstName lastName email image');

    const totalMessages = await Message.countDocuments({ conversationId });
    const totalPages = Math.ceil(totalMessages / parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        recipient: studentId,
        status: { $ne: 'read' }
      },
      {
        $set: { status: 'read', readAt: new Date() }
      }
    );

    // Emit read event via socket
    const io = req.app.get('io');
    messages.forEach(msg => {
      if (msg.recipient._id.toString() === studentId && msg.status !== 'read') {
        io.to(msg.sender._id.toString()).emit('message-read', {
          messageId: msg._id,
          conversationId,
          readAt: new Date()
        });
      }
    });

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMessages,
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

/**
 * Send a message to admin
 * @route POST /api/v1/student/messages/send
 * @access Private (Student only)
 */
exports.sendMessage = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { recipientId, content, attachments } = req.body;

    // Validation
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and content are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    // Verify recipient is an admin
    const admin = await Admin.findById(recipientId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Get student info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Generate conversation ID (consistent for both directions)
    const conversationId = [studentId, recipientId].sort().join('-');

    // Create message
    const message = await Message.create({
      conversationId,
      sender: studentId,
      senderModel: 'student',
      recipient: recipientId,
      recipientModel: 'Admin',
      content: content.trim(),
      attachments: attachments || [],
      status: 'sent'
    });

    // Populate message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email image')
      .populate('recipient', 'email firstName lastName');

    // Emit real-time event to admin
    const io = req.app.get('io');
    io.to(recipientId).emit('new-message', { message: populatedMessage });

    return res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

/**
 * Mark message as read
 * @route PUT /api/v1/student/messages/:messageId/read
 * @access Private (Student only)
 */
exports.markMessageAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      recipient: studentId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.status === 'read') {
      return res.status(200).json({
        success: true,
        message: 'Message already marked as read'
      });
    }

    message.status = 'read';
    message.readAt = new Date();
    await message.save();

    // Emit read event to sender
    const io = req.app.get('io');
    io.to(message.sender.toString()).emit('message-read', {
      messageId: message._id,
      conversationId: message.conversationId,
      readAt: message.readAt
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email image')
      .populate('recipient', 'firstName lastName email image');

    return res.status(200).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
};

/**
 * Get message statistics for student
 * @route GET /api/v1/student/messages/stats
 * @access Private (Student only)
 */
exports.getMessageStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: studentId },
        { recipient: studentId }
      ]
    });

    const unreadMessages = await Message.countDocuments({
      recipient: studentId,
      status: { $ne: 'read' }
    });

    // Count unique conversations
    const messages = await Message.find({
      $or: [
        { sender: studentId },
        { recipient: studentId }
      ]
    }).select('conversationId');

    const uniqueConversations = new Set(messages.map(m => m.conversationId));

    // Today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await Message.countDocuments({
      $or: [
        { sender: studentId },
        { recipient: studentId }
      ],
      createdAt: { $gte: today }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalMessages,
        unreadMessages,
        activeConversations: uniqueConversations.size,
        todayMessages
      }
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * Delete a message (soft delete)
 * @route DELETE /api/v1/student/messages/:messageId
 * @access Private (Student only)
 */
exports.deleteMessage = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: studentId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }

    message.isDeleted = true;
    await message.save();

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};
