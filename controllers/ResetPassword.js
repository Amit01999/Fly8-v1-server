const User = require('../models/Student');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//resetPasswordToken :- it generate token and send URL with Token to the user;
const resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email; //get email from req body
    const user = await User.findOne({ email: email }); //check user for this email,find user which email is matched to this email;
    if (!user) {
      //if there is no any user for this email;
      return res.json({
        success: false,
        message: 'Your Email is not registered',
      });
    }

    const token = crypto.randomBytes(20).toString('hex'); //generate token and we add expiration time in that token and then we add that token
    const updatedDetails = await User.findOneAndUpdate(
      // URL so the URL which will be sent to user to reset password will expire after certain time;
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    ); // {new:true} added because it return updated object so updatedDetails contain updated details;
    const url = `https://www.fly8.global/update-password/${token}`;
    // const url = `http://localhost:8080/update-password/${token}`;
    await mailSender(
      email,
      'Fly8 Password Reset',
      `
        <h2>Fly8 Password Reset</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested to reset your password. Please click the link below to set a new password:</p>
        <a href="${url}" style="color: #2563eb; text-decoration: underline;">Reset Password</a>
        <p>This link will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>The Fly8 Team</p>
      `
    ); //send mail containing the url

    return res.json({
      //return response
      success: true,
      message: 'Email sent successfully, please check email and change pwd',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while sending reset pwd mail',
    });
  }
};

//resetPassword/
const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body; //data fetch
    if (!password || !confirmPassword || !token) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      //validation
      return res.json({ success: false, message: 'Password not matching' });
    }

    const userDetails = await User.findOne({ token: token }); //get userdetails from db using token
    if (!userDetails) {
      //if no entry - invalid token
      return res.json({ success: false, message: 'Token is invalid' });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Token expired, please request a new link',
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 10); //hash password

    //password update IN DB;
    await User.findOneAndUpdate(
      { token },
      {
        password: encryptedPassword,
        token: null, // Clear token
        resetPasswordExpires: null, // Clear expiry
      },
      { new: true }
    );

    return res.status(200).json({
      //return response
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while sending reset pwd mail',
    });
  }
};

module.exports = { resetPasswordToken, resetPassword };
