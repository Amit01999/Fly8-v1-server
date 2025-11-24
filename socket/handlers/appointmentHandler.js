/**
 * ================================================
 * APPOINTMENT SOCKET HANDLER
 * ================================================
 * Handles all real-time appointment events
 */

const Appointment = require('../../models/Appointment');

module.exports = (io, socket) => {
  /**
   * Get upcoming appointments
   */
  socket.on('get-upcoming-appointments', async () => {
    try {
      const query = {
        status: 'confirmed',
        date: { $gte: new Date() }
      };

      if (socket.userType === 'student') {
        query.student = socket.userId;
      } else if (socket.userType === 'admin') {
        query.advisor = socket.userId;
      }

      const appointments = await Appointment.find(query)
        .sort({ date: 1, time: 1 })
        .limit(10)
        .populate('student', 'firstName lastName email phone image')
        .populate('advisor', 'email firstName lastName');

      socket.emit('upcoming-appointments', { appointments });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      socket.emit('error', { message: 'Failed to fetch appointments' });
    }
  });

  /**
   * Get appointment count by status
   */
  socket.on('get-appointment-counts', async () => {
    try {
      const query = {};

      if (socket.userType === 'student') {
        query.student = socket.userId;
      } else if (socket.userType === 'admin') {
        query.advisor = socket.userId;
      }

      const pending = await Appointment.countDocuments({ ...query, status: 'pending' });
      const confirmed = await Appointment.countDocuments({ ...query, status: 'confirmed' });
      const completed = await Appointment.countDocuments({ ...query, status: 'completed' });

      socket.emit('appointment-counts', {
        pending,
        confirmed,
        completed
      });
    } catch (error) {
      console.error('Error fetching appointment counts:', error);
    }
  });

  /**
   * Join appointment room for real-time updates
   */
  socket.on('join-appointment', (appointmentId) => {
    try {
      socket.join(`appointment-${appointmentId}`);
      console.log(`User ${socket.userId} joined appointment room: ${appointmentId}`);
    } catch (error) {
      console.error('Error joining appointment room:', error);
    }
  });

  /**
   * Leave appointment room
   */
  socket.on('leave-appointment', (appointmentId) => {
    try {
      socket.leave(`appointment-${appointmentId}`);
      console.log(`User ${socket.userId} left appointment room: ${appointmentId}`);
    } catch (error) {
      console.error('Error leaving appointment room:', error);
    }
  });
};
