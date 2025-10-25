const Appointment = require('../models/Appointment');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Get all appointments with filters
exports.getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      type = 'all',
      dateFrom,
      dateTo,
      studentId,
    } = req.query;

    const query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (type !== 'all') {
      query.type = type;
    }

    if (studentId) {
      query.student = studentId;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate('student', 'firstName lastName email phone image')
      .populate('advisor', 'firstName lastName email')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

// Get single appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('student', 'firstName lastName email phone image country')
      .populate('advisor', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      studentId,
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      duration,
      meetingLink,
      location,
      notes,
    } = req.body;

    if (!studentId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: studentId, title, date, startTime, endTime',
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

    const appointment = await Appointment.create({
      student: studentId,
      advisor: req.user.id,
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      duration,
      meetingLink,
      location,
      notes,
      status: 'confirmed',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('student', 'firstName lastName email')
      .populate('advisor', 'firstName lastName email');

    // Create notification for student
    await Notification.create({
      recipient: studentId,
      recipientModel: 'student',
      title: 'New Appointment Scheduled',
      message: `Your appointment "${title}" has been scheduled for ${new Date(
        date
      ).toLocaleDateString()} at ${startTime}`,
      type: 'appointment',
      priority: 'high',
      link: `/appointments/${appointment._id}`,
      metadata: { appointmentId: appointment._id },
    });

    // Emit socket event
    if (req.io) {
      req.io.to(studentId).emit('new-appointment', populatedAppointment);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message,
    });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating student reference
    delete updates.student;

    const appointment = await Appointment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'firstName lastName email')
      .populate('advisor', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Notify student of update
    await Notification.create({
      recipient: appointment.student._id,
      recipientModel: 'student',
      title: 'Appointment Updated',
      message: `Your appointment "${appointment.title}" has been updated`,
      type: 'appointment',
      priority: 'medium',
      link: `/appointments/${appointment._id}`,
    });

    // Emit socket event
    if (req.io) {
      req.io.to(appointment.student._id.toString()).emit('appointment-updated', appointment);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message,
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;

    const appointment = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate('student', 'firstName lastName email')
      .populate('advisor', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Notify student
    const statusMessages = {
      confirmed: 'has been confirmed',
      cancelled: 'has been cancelled',
      completed: 'has been marked as completed',
      'no-show': 'was marked as no-show',
    };

    await Notification.create({
      recipient: appointment.student._id,
      recipientModel: 'student',
      title: 'Appointment Status Update',
      message: `Your appointment "${appointment.title}" ${statusMessages[status] || 'has been updated'}`,
      type: status === 'cancelled' ? 'warning' : 'info',
      priority: 'medium',
      link: `/appointments/${appointment._id}`,
    });

    // Emit socket event
    if (req.io) {
      req.io.to(appointment.student._id.toString()).emit('appointment-status-changed', appointment);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message,
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancelledBy: req.user.id,
        cancelledByModel: 'Admin',
        cancellationReason: reason,
      },
      { new: true }
    )
      .populate('student', 'firstName lastName email')
      .populate('advisor', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Notify student
    await Notification.create({
      recipient: appointment.student._id,
      recipientModel: 'student',
      title: 'Appointment Cancelled',
      message: `Your appointment "${appointment.title}" has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      type: 'warning',
      priority: 'high',
      link: `/appointments/${appointment._id}`,
    });

    // Emit socket event
    if (req.io) {
      req.io.to(appointment.student._id.toString()).emit('appointment-cancelled', appointment);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message,
    });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message,
    });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const total = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    const upcomingAppointments = await Appointment.countDocuments({
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] },
    });

    const completedAppointments = await Appointment.countDocuments({
      status: 'completed',
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: 'cancelled',
    });

    const appointmentsByType = await Appointment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        appointmentsByType,
        appointmentsByStatus,
      },
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment statistics',
      error: error.message,
    });
  }
};

// Get upcoming appointments for today
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('student', 'firstName lastName email phone image')
      .populate('advisor', 'firstName lastName email')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      appointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s appointments',
      error: error.message,
    });
  }
};
