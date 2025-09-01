const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile');
require('dotenv').config();

//signUp
const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, country, referral } =
      req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !country) {
      return res.status(403).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student is already registered',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create profile entry first
    const profileDetails = await Profile.create({
      student: null, // Allowed since student is not required
    });

    // Create student entry with profile ID
    const student = await Student.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      country,
      referral: referral || null,
      approved: true,
      active: true,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // Update profile with student ID
    await Profile.findByIdAndUpdate(profileDetails._id, {
      student: student._id,
    });

    return res.status(200).json({
      success: true,
      student,
      message: 'Student is registered successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Student cannot be registered. Please try again',
    });
  }
};
// const signUp = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       phone,
//       country,
//       referral,
//       otp,
//     } = req.body;

//     // Validate required fields
//     if (
//       !firstName ||
//       !lastName ||
//       !email ||
//       !password ||
//       !phone ||
//       !country ||
//       !otp
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: 'All required fields must be provided',
//       });
//     }

//     // Check if student already exists
//     const existingStudent = await Student.findOne({ email });
//     if (existingStudent) {
//       return res.status(400).json({
//         success: false,
//         message: 'Student is already registered',
//       });
//     }

//     // Find the most recent OTP for the email
//     const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
//     if (response.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'OTP NOT Found',
//       });
//     } else if (otp !== response[0].otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid OTP',
//       });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create empty profile entry
//     const profileDetails = await Profile.create({
//       student: null, // Will be set after student creation
//     });

//     // Create student entry with optional referral
//     const student = await Student.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       phone,
//       country,
//       referral: referral || null,
//       approved: true,
//       active: true, // From your provided studentSchema
//       additionalDetails: profileDetails._id,
//       image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
//     });

//     // Update profile with student ID
//     profileDetails.student = student._id;
//     await profileDetails.save();

//     return res.status(200).json({
//       success: true,
//       student,
//       message: 'Student is registered successfully',
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: 'Student cannot be registered. Please try again',
//     });
//   }
// };
//Login
const login = async (req, res) => {
  try {
    console.log('i am sinf i am hit');
    const { email, password } = req.body; //get data from req body

    if (!email || !password) {
      // validate krlo means all inbox are filled or not;
      return res.status(403).json({
        success: false,
        message: 'Please Fill up All the Required Fields',
      });
    }

    const student = await Student.findOne({ email }).populate(
      'additionalDetails'
    ); //student check exist or not
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Student is not registrered, please signup first',
      });
    }

    if (await bcrypt.compare(password, student.password)) {
      //generate JWT, after password matching/comparing
      const payload = {
        // generate payload;
        email: student.email,
        id: student._id,
        accountType: student.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        // generate token (combination of header , payload , signature)
        expiresIn: '20h', // set expiry time;
      });

      student.token = token;
      student.password = undefined;

      const options = {
        //create cookie and send response
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie('token', token, options).status(200).json({
        success: true,
        token,
        student,
        message: 'Logged in successfully',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Login Failure, please try again',
    });
  }
};

//sendOTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body; //fetch email from request ki body
    const checkStudentPresent = await Student.findOne({ email }); //check if Student already exist

    if (checkStudentPresent) {
      //if Student already exist , then return a response
      return res.status(401).json({
        success: false,
        message: 'Student already registered',
      });
    }

    var otp = otpGenerator.generate(6, {
      //generate otp of 6 digit number donot contain uppercase,lowercase,specialchar;
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log('OTP generated: ', otp);

    let result = await OTP.findOne({ otp: otp }); //check unique otp or not
    while (result) {
      // if result is true so we regenerate otp;
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }

    const otpPayload = { email, otp };

    //create an entry in OTP in DB and this OTP is used in SignUp to find response;
    const otpBody = await OTP.create(otpPayload);
    console.log('OTP Body', otpBody);

    res.status(200).json({
      //return response successful
      success: true,
      message: 'OTP Sent Successfully',
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller for Changing Password
const changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id); // Get user data from req.user
    const { oldPassword, newPassword, confirmNewPassword } = req.body; // Get old password, new password, and confirm new password from req.body

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    ); // Validate old password

    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: 'The password is incorrect' });
    }

    if (newPassword !== confirmNewPassword) {
      // Match new password and confirm new password
      return res.status(401).json({
        success: false,
        message: 'The password and confirm password does not match',
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10); // Update password
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );
    // find user by id and then update password = encryptedPassword , here if you "const updatedUserDetails =" does not wirte this then also it not affect;

    try {
      // Send notification email , here passwordUpdated is template of email which is send to user;
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log('Email sent successfully:', emailResponse.response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error occurred while sending email',
        error: error.message,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Password updated successfully' }); // Return success response
  } catch (error) {
    console.error('Error occurred while updating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error occurred while updating password',
      error: error.message,
    });
  }
};

module.exports = { signUp, login, sendOTP, changePassword };
