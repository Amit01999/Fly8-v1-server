const Registration = require('../models/GstuRegistration');
const nodemailer = require('nodemailer');

const register = async (req, res) => {
  try {
    const formData = req.body;

    // Generate unique registration number
    let regNum;
    let isUnique = false;
    while (!isUnique) {
      regNum = 'GEG2025' + Math.floor(Math.random() * 90000 + 10000).toString();
      const existing = await Registration.findOne({
        registrationNumber: regNum,
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const registration = new Registration({
      ...formData,
      registrationNumber: regNum,
    });

    await registration.save();

    // Send email using nodemailer (configure with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your email service
      auth: {
        user: process.env.MAIL_USER, // Set in .env
        pass: process.env.MAIL_PASS, // Set in .env
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: formData.email,
      subject: 'Registration Successful - Global Education Gateway Summit 2025',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🎉 Congratulations!</h1>
            <h2>Registration Successful</h2>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px;">Dear <strong>${formData.fullName}</strong>,</p>
            
            <p>You have successfully registered for the <strong>Global Education Gateway Summit 2025</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #667eea;">Your Registration Details:</h3>
              <p><strong>Registration Number:</strong> <span style="font-size: 24px; color: #764ba2;">${regNum}</span></p>
              <p style="color: red;">⚠️ Please save this number carefully!</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
              <h3>📍 Ticket Collection:</h3>
              <p>Visit our Registration Booth at <strong>JoyBangla Chattor, GSTU, Gopalganj</strong> with your registration number to collect your event ticket.</p>
            </div>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #0c5460;">
              <h3>📅 Event Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li>📅 <strong>Date:</strong> 20 September, 2025</li>
                <li>🕙 <strong>Time:</strong> 10:00 AM – 5:00 PM</li>
                <li>📍 <strong>Venue:</strong> Gopalganj Science and Technology University</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;"><strong>Note:</strong> Keep your ticket safe! It will be required not only for this event but also for all future opportunities and offers from Fly8.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p>For any queries, contact us at:</p>
              <p>📧 Email: contact@fly8.global</p>
              <p>📱 WhatsApp: +880 1784073483</p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p>© 2025 Fly8 & GSTU Research and Higher Studies Society</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ registrationNumber: regNum });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get registration by registration number
const getRegistration = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    const registration = await Registration.findOne({ registrationNumber });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration',
      error: error.message,
    });
  }
};

// Check if email or phone already registered
const checkExisting = async (req, res) => {
  try {
    const { email, contactNumber } = req.body;

    const existing = await Registration.findOne({
      $or: [{ email }, { contactNumber }],
    });

    if (existing) {
      return res.status(200).json({
        exists: true,
        message: 'You have already registered for this event',
        registrationNumber: existing.registrationNumber,
      });
    }

    res.status(200).json({
      exists: false,
    });
  } catch (error) {
    console.error('Check existing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking registration',
      error: error.message,
    });
  }
};

// Mark ticket as collected
const collectTicket = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    const registration = await Registration.findOneAndUpdate(
      { registrationNumber },
      {
        ticketCollected: true,
        ticketCollectionDate: new Date(),
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket collection marked successfully',
      data: registration,
    });
  } catch (error) {
    console.error('Ticket collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket collection',
      error: error.message,
    });
  }
};

// Get all registrations (admin)
const getAllRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { registrationNumber: { $regex: search, $options: 'i' } },
            { contactNumber: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Registration.countDocuments(query);

    res.status(200).json({
      success: true,
      data: registrations,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRegistrations: count,
    });
  } catch (error) {
    console.error('Get all registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message,
    });
  }
};

// Get registration statistics (admin)
const getStatistics = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const ticketsCollected = await Registration.countDocuments({
      ticketCollected: true,
    });

    const destinationStats = await Registration.aggregate([
      { $unwind: '$studyDestinations' },
      { $group: { _id: '$studyDestinations', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const programLevelStats = await Registration.aggregate([
      { $group: { _id: '$programLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const universityStats = await Registration.aggregate([
      { $group: { _id: '$universityName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        ticketsCollected,
        ticketsPending: totalRegistrations - ticketsCollected,
        destinationStats,
        programLevelStats,
        topUniversities: universityStats,
      },
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  getRegistration,
  checkExisting,
  collectTicket,
  getAllRegistrations,
  getStatistics,
};
