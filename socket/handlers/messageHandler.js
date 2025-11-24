/**
 * ================================================
 * MESSAGE SOCKET HANDLER
 * ================================================
 * Handles all real-time messaging events
 */

const Message = require('../../models/Message');

module.exports = (io, socket) => {
  /**
   * Join a conversation room
   */
  socket.on('join-conversation', (conversationId) => {
    try {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  /**
   * Leave a conversation room
   */
  socket.on('leave-conversation', (conversationId) => {
    try {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  });

  /**
   * Handle typing indicator
   */
  socket.on('typing', ({ conversationId, userId, userName }) => {
    try {
      // Broadcast to all users in the conversation except sender
      socket.to(conversationId).emit('typing', {
        conversationId,
        userId,
        userName
      });
    } catch (error) {
      console.error('Error broadcasting typing:', error);
    }
  });

  /**
   * Handle stop typing indicator
   */
  socket.on('stop-typing', ({ conversationId, userId }) => {
    try {
      socket.to(conversationId).emit('stop-typing', {
        conversationId,
        userId
      });
    } catch (error) {
      console.error('Error broadcasting stop typing:', error);
    }
  });

  /**
   * Mark message as delivered
   */
  socket.on('mark-message-delivered', async ({ messageId, conversationId }) => {
    try {
      const message = await Message.findById(messageId);

      if (message && message.status === 'sent') {
        message.status = 'delivered';
        await message.save();

        // Emit to sender
        io.to(message.sender.toString()).emit('message-delivered', {
          messageId,
          conversationId,
          deliveredAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  });

  /**
   * Mark message as read (via socket)
   */
  socket.on('mark-message-read', async (messageId) => {
    try {
      const message = await Message.findById(messageId);

      if (message && message.recipient.toString() === socket.userId) {
        message.status = 'read';
        message.readAt = new Date();
        await message.save();

        // Emit to sender
        io.to(message.sender.toString()).emit('message-read', {
          messageId,
          conversationId: message.conversationId,
          readAt: message.readAt
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  /**
   * Send message via socket (alternative to API)
   */
  socket.on('send-message', async ({ conversationId, recipientId, content, attachments }) => {
    try {
      const message = await Message.create({
        conversationId,
        sender: socket.userId,
        senderModel: socket.userType === 'student' ? 'student' : 'Admin',
        recipient: recipientId,
        recipientModel: socket.userType === 'student' ? 'Admin' : 'student',
        content,
        attachments: attachments || [],
        status: 'sent'
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'firstName lastName email image')
        .populate('recipient', 'firstName lastName email image');

      // Emit to recipient
      io.to(recipientId).emit('new-message', { message: populatedMessage });

      // Emit to conversation room
      io.to(conversationId).emit('new-message', { message: populatedMessage });

      // Send acknowledgment to sender
      socket.emit('message-sent', { message: populatedMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};
