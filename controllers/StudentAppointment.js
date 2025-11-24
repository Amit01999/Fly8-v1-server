/**
 * ================================================
 * STUDENT APPOINTMENT CONTROLLER
 * ================================================
 * Handles student-side appointment operations with real-time notifications
 */

const Appointment = require('../models/Appointment');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');

/**
 * Get all appointments for a student
 * @route GET /api/v1/student/appointments
 * @access Private (Student only)
 */
exports.getMyAppointments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { student: studentId };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('student', 'firstName lastName email phone image')
      .populate('advisor', 'email firstName lastName');

    const totalAppointments = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / parseInt(limit));

    return res.status(200).json({
      success: true,
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAppointments,
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching student appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

/**
 * Get appointment by ID
 * @route GET /api/v1/student/appointments/:id
 * @access Private (Student only)
 */
exports.getAppointmentById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      student: studentId
    })
    .populate('student', 'firstName lastName email phone image')
    .populate('advisor', 'email firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    return res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

/**
 * Create a new appointment request
 * @route POST /api/v1/student/appointments
 * @access Private (Student only)
 */
exports.createAppointment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { date, time, duration, type, purpose, notes } = req.body;

    // Validation
    if (!date || !time || !type || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Date, time, type, and purpose are required'
      });
    }

    // Check if date is in the future
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      student: studentId,
      date: appointmentDate,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment at this time'
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

    // Create appointment
    const appointment = await Appointment.create({
      student: studentId,
      date: appointmentDate,
      time,
      duration: duration || 30,
      type,
      purpose,
      notes,
      status: 'pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('student', 'firstName lastName email phone image')
      .populate('advisor', 'email firstName lastName');

    // Notify all admins about new appointment request
    const admins = await Admin.find({ isActive: true });
    const io = req.app.get('io');

    for (const admin of admins) {
      // Create notification
      const notification = await Notification.create({
        recipient: admin._id,
        recipientModel: 'Admin',
        title: 'New Appointment Request',
        message: `${student.firstName} ${student.lastName} has requested an appointment for ${type}`,
        type: 'appointment',
        priority: 'medium',
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          studentId: student._id,
          date: appointmentDate,
          time
        }
      });

      // Emit socket event
      io.to(admin._id.toString()).emit('new-appointment', {
        appointment: populatedAppointment
      });

      io.to(admin._id.toString()).emit('new-notification', {
        notification: await notification.populate('recipient', 'email firstName lastName')
      });
    }

    return res.status(201).json({
      success: true,
      appointment: populatedAppointment,
      message: 'Appointment request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

/**
 * Cancel an appointment
 * @route PUT /api/v1/student/appointments/:id/cancel
 * @access Private (Student only)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      student: studentId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = 'cancelled';
    if (reason) {
      appointment.notes = appointment.notes
        ? `${appointment.notes}\n\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('student', 'firstName lastName email phone image')
      .populate('advisor', 'email firstName lastName');

    // Notify admin if assigned
    if (appointment.advisor) {
      const notification = await Notification.create({
        recipient: appointment.advisor,
        recipientModel: 'Admin',
        title: 'Appointment Cancelled',
        message: `Student has cancelled the appointment scheduled for ${appointment.date.toDateString()} at ${appointment.time}`,
        type: 'appointment',
        priority: 'medium',
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          studentId: appointment.student,
          reason
        }
      });

      const io = req.app.get('io');
      io.to(appointment.advisor.toString()).emit('appointment-cancelled', {
        appointmentId: appointment._id,
        reason,
        cancelledBy: 'student'
      });

      io.to(appointment.advisor.toString()).emit('new-notification', {
        notification: await notification.populate('recipient', 'email firstName lastName')
      });
    }

    return res.status(200).json({
      success: true,
      appointment: populatedAppointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

/**
 * Get appointment statistics for student
 * @route GET /api/v1/student/appointments/stats
 * @access Private (Student only)
 */
exports.getAppointmentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const total = await Appointment.countDocuments({ student: studentId });
    const pending = await Appointment.countDocuments({ student: studentId, status: 'pending' });
    const confirmed = await Appointment.countDocuments({ student: studentId, status: 'confirmed' });
    const completed = await Appointment.countDocuments({ student: studentId, status: 'completed' });
    const cancelled = await Appointment.countDocuments({ student: studentId, status: 'cancelled' });
    const rejected = await Appointment.countDocuments({ student: studentId, status: 'rejected' });

    // Upcoming appointments (confirmed, date in future)
    const upcomingCount = await Appointment.countDocuments({
      student: studentId,
      status: 'confirmed',
      date: { $gte: new Date() }
    });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        rejected,
        upcomingCount
      }
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * Get available time slots for a specific date
 * @route GET /api/v1/student/appointments/available-slots
 * @access Private (Student only)
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const selectedDate = new Date(date);

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }

    // Define available time slots (9 AM to 5 PM, 30-minute intervals)
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ time, available: true });
      }
    }

    // Get booked appointments for this date
    const bookedAppointments = await Appointment.find({
      date: selectedDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    // Mark booked slots as unavailable
    const bookedTimes = bookedAppointments.map(apt => apt.time);
    slots.forEach(slot => {
      if (bookedTimes.includes(slot.time)) {
        slot.available = false;
      }
    });

    return res.status(200).json({
      success: true,
      date: selectedDate.toISOString().split('T')[0],
      slots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};
