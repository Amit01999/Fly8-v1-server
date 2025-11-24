/**
 * ================================================
 * NOTIFICATION SOCKET HANDLER
 * ================================================
 * Handles all real-time notification events
 */

const Notification = require('../../models/Notification');

module.exports = (io, socket) => {
  /**
   * Mark notification as read (via socket)
   */
  socket.on('mark-notification-read', async (notificationId) => {
    try {
      const notification = await Notification.findById(notificationId);

      if (notification && notification.recipient.toString() === socket.userId) {
        notification.status = 'read';
        notification.readAt = new Date();
        await notification.save();

        // Confirm to sender
        socket.emit('notification-read', {
          notificationId,
          readAt: notification.readAt
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  /**
   * Request notification history
   */
  socket.on('get-notifications', async ({ status, limit = 20 }) => {
    try {
      const query = {
        recipient: socket.userId,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      };

      if (status) {
        query.status = status;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('recipient', 'firstName lastName email image');

      socket.emit('notifications-list', { notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      socket.emit('error', { message: 'Failed to fetch notifications' });
    }
  });

  /**
   * Get unread notification count
   */
  socket.on('get-unread-count', async () => {
    try {
      const count = await Notification.countDocuments({
        recipient: socket.userId,
        status: 'unread',
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      socket.emit('unread-count', { count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  });
};
