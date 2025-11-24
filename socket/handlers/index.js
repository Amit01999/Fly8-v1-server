/**
 * ================================================
 * SOCKET HANDLERS - INDEX
 * ================================================
 * Central export for all socket event handlers
 */

const messageHandler = require('./messageHandler');
const notificationHandler = require('./notificationHandler');
const appointmentHandler = require('./appointmentHandler');

/**
 * Initialize all socket handlers for a connection
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Individual socket connection
 */
module.exports = (io, socket) => {
  console.log(`Socket connected: ${socket.id}, User: ${socket.userId}, Type: ${socket.userType}`);

  // Initialize all handlers
  messageHandler(io, socket);
  notificationHandler(io, socket);
  appointmentHandler(io, socket);

  /**
   * Handle user joining their personal room
   */
  socket.on('join', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    console.log(`User ${userId} joined personal room`);

    // Emit online status
    io.emit('user-online', {
      userId,
      userType: socket.userType,
      timestamp: new Date()
    });
  });

  /**
   * Handle user leaving their personal room
   */
  socket.on('leave', (userId) => {
    socket.leave(userId);
    console.log(`User ${userId} left personal room`);
  });

  /**
   * Handle status update
   */
  socket.on('status-update', (status) => {
    socket.status = status;
    console.log(`User ${socket.userId} status: ${status}`);
  });

  /**
   * Handle disconnection
   */
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);

    if (socket.userId) {
      // Emit offline status
      io.emit('user-offline', {
        userId: socket.userId,
        userType: socket.userType,
        lastSeen: new Date()
      });
    }
  });

  /**
   * Handle errors
   */
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
    socket.emit('error', {
      code: 'SERVER_ERROR',
      message: 'An error occurred',
      details: error.message
    });
  });
};
