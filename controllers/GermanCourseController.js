const GermanCourseRegistration = require('../models/GermanCourseRegistration');
const nodemailer = require('nodemailer');

/**
 * Register a new student for German Language Free Course
 * POST /api/german-course/register
 */
const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      whatsappNumber,
      academicLevel,
      otherAcademicLevel,
      previousFly8Course,
      fly8Relation,
      otherFly8Relation,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !whatsappNumber || !academicLevel || !previousFly8Course || !fly8Relation) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled',
      });
    }

    // Check if email already exists
    const existingRegistration = await GermanCourseRegistration.findOne({ email });
    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered for the German Language Course',
        registrationNumber: existingRegistration.registrationNumber,
      });
    }

    // Generate unique registration number
    let registrationNumber;
    let isUnique = false;
    while (!isUnique) {
      // Format: GLC2025XXXXX (GLC = German Language Course)
      registrationNumber = 'GLC2025' + Math.floor(Math.random() * 90000 + 10000).toString();
      const existing = await GermanCourseRegistration.findOne({ registrationNumber });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create new registration
    const registration = new GermanCourseRegistration({
      fullName,
      email,
      whatsappNumber,
      academicLevel,
      otherAcademicLevel: academicLevel === 'Other' ? otherAcademicLevel : undefined,
      previousFly8Course,
      fly8Relation,
      otherFly8Relation: fly8Relation === 'Other' ? otherFly8Relation : undefined,
      registrationNumber,
    });

    await registration.save();

    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Registration Successful - German Language Free Course',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <h2 style="margin: 10px 0 0 0; font-weight: normal;">Registration Successful</h2>
            </div>

            <!-- Body -->
            <div style="padding: 30px; background: white;">
              <p style="font-size: 18px; color: #333;">Dear <strong>${fullName}</strong>,</p>

              <p style="color: #555; line-height: 1.6;">
                Thank you for registering for the <strong>German Language Free Course</strong> with Fly8!
              </p>

              <!-- Registration Details -->
              <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">📋 Your Registration Details:</h3>
                <p style="margin: 5px 0;"><strong>Registration Number:</strong></p>
                <p style="font-size: 24px; color: #764ba2; font-weight: bold; margin: 5px 0;">${registrationNumber}</p>
                <p style="color: #d9534f; margin: 5px 0;">⚠️ Please save this number for future reference!</p>
              </div>

              <!-- Course Details -->
              <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; border-left: 4px solid #2196f3; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">📚 Course Details:</h3>
                <ul style="list-style: none; padding: 0; color: #555;">
                  <li style="margin: 8px 0;">📅 <strong>Start Date:</strong> 27 November, 2025</li>
                  <li style="margin: 8px 0;">🎓 <strong>Total Classes:</strong> 8</li>
                  <li style="margin: 8px 0;">💰 <strong>Course Fee:</strong> FREE</li>
                  <li style="margin: 8px 0;">🌍 <strong>Language:</strong> German (Beginner Level)</li>
                </ul>
              </div>

              <!-- Next Steps -->
              <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">📌 Next Steps:</h3>
                <ol style="color: #555; line-height: 1.8;">
                  <li>Keep your registration number safe</li>
                  <li>Join our WhatsApp group (link will be shared soon)</li>
                  <li>Check your email regularly for course updates</li>
                  <li>Prepare to learn German! 🇩🇪</li>
                </ol>
              </div>

              <!-- Important Note -->
              <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                  <strong>📢 Important:</strong> You will receive class schedule and joining details via email and WhatsApp before the course starts.
                </p>
              </div>

              <!-- Contact Info -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
                <p style="color: #555; margin: 5px 0;">For any queries, contact us:</p>
                <p style="margin: 5px 0; color: #667eea;"><strong>📧 Email:</strong> contact@fly8.global</p>
                <p style="margin: 5px 0; color: #667eea;"><strong>📱 WhatsApp:</strong> +880 1784073483</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="margin: 0; font-size: 14px;">© 2025 Fly8 - Your Global Education Partner</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #bbb;">Best wishes for your German language learning journey!</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for confirmation.',
      registrationNumber,
      data: registration,
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

/**
 * Get all registrations with pagination and search
 * GET /api/german-course/registrations
 */
const getAllRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Build search query
    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { registrationNumber: { $regex: search, $options: 'i' } },
            { whatsappNumber: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Get paginated registrations
    const registrations = await GermanCourseRegistration.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const totalCount = await GermanCourseRegistration.countDocuments(query);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalRegistrations: totalCount,
        limit: parseInt(limit),
      },
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

/**
 * Get single registration by registration number
 * GET /api/german-course/registration/:registrationNumber
 */
const getRegistrationByNumber = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    const registration = await GermanCourseRegistration.findOne({
      registrationNumber,
    });

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

/**
 * Check if email already exists
 * POST /api/german-course/check-email
 */
const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const existing = await GermanCourseRegistration.findOne({ email });

    if (existing) {
      return res.status(200).json({
        exists: true,
        message: 'This email is already registered',
        registrationNumber: existing.registrationNumber,
      });
    }

    res.status(200).json({
      exists: false,
      message: 'Email is available',
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email',
      error: error.message,
    });
  }
};

/**
 * Get registration statistics (for admin dashboard)
 * GET /api/german-course/statistics
 */
const getStatistics = async (req, res) => {
  try {
    // Total registrations
    const totalRegistrations = await GermanCourseRegistration.countDocuments();

    // Group by academic level
    const academicLevelStats = await GermanCourseRegistration.aggregate([
      { $group: { _id: '$academicLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Group by previous course participation
    const previousCourseStats = await GermanCourseRegistration.aggregate([
      { $group: { _id: '$previousFly8Course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Group by Fly8 relation
    const fly8RelationStats = await GermanCourseRegistration.aggregate([
      { $group: { _id: '$fly8Relation', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Registrations per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRegistrations = await GermanCourseRegistration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        academicLevelStats,
        previousCourseStats,
        fly8RelationStats,
        dailyRegistrations,
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

/**
 * Delete a registration (admin only)
 * DELETE /api/german-course/registration/:id
 */
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await GermanCourseRegistration.findByIdAndDelete(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
    });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting registration',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  getAllRegistrations,
  getRegistrationByNumber,
  checkEmailExists,
  getStatistics,
  deleteRegistration,
};
