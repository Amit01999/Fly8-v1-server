const Message = require('../models/Message');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Get all conversations for admin
exports.getAllConversations = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: adminId }, { recipient: adminId }],
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', adminId] },
                    { $eq: ['$status', 'sent'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Populate student details for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = conv.lastMessage;
        const studentId =
          lastMsg.senderModel === 'student'
            ? lastMsg.sender
            : lastMsg.recipient;

        const student = await Student.findById(studentId).select(
          'firstName lastName email image'
        );

        return {
          conversationId: conv._id,
          student,
          lastMessage: lastMsg,
          unreadCount: conv.unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: conversationsWithDetails,
    });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .populate('sender', 'firstName lastName image')
      .populate('recipient', 'firstName lastName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false,
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        recipient: req.user.id,
        status: { $ne: 'read' },
      },
      {
        status: 'read',
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Send a message to a student
exports.sendMessage = async (req, res) => {
  try {
    const { studentId, content, attachments = [] } = req.body;
    const adminId = req.user.id;

    if (!studentId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and message content are required',
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

    // Generate conversation ID (consistent for both directions)
    const conversationId = [studentId, adminId].sort().join('-');

    const message = await Message.create({
      conversationId,
      sender: adminId,
      senderModel: 'Admin',
      recipient: studentId,
      recipientModel: 'student',
      content,
      attachments,
      status: 'sent',
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName image')
      .populate('recipient', 'firstName lastName email image');

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(studentId).emit('new-message', populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        status: 'read',
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message,
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

// Get message statistics
exports.getMessageStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    const totalSent = await Message.countDocuments({
      sender: adminId,
      senderModel: 'Admin',
    });

    const totalReceived = await Message.countDocuments({
      recipient: adminId,
      recipientModel: 'Admin',
    });

    const unreadMessages = await Message.countDocuments({
      recipient: adminId,
      recipientModel: 'Admin',
      status: { $ne: 'read' },
    });

    const totalConversations = await Message.distinct('conversationId', {
      $or: [
        { sender: adminId, senderModel: 'Admin' },
        { recipient: adminId, recipientModel: 'Admin' },
      ],
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSent,
        totalReceived,
        unreadMessages,
        activeConversations: totalConversations.length,
      },
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message statistics',
      error: error.message,
    });
  }
};

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const { query, conversationId } = req.query;
    const adminId = req.user.id;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const searchCriteria = {
      $or: [
        { sender: adminId, senderModel: 'Admin' },
        { recipient: adminId, recipientModel: 'Admin' },
      ],
      content: { $regex: query, $options: 'i' },
      isDeleted: false,
    };

    if (conversationId) {
      searchCriteria.conversationId = conversationId;
    }

    const messages = await Message.find(searchCriteria)
      .populate('sender', 'firstName lastName image')
      .populate('recipient', 'firstName lastName image')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching messages',
      error: error.message,
    });
  }
};
