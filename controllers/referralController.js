// controllers/referralController.js
const Student = require('../models/Student');

exports.searchReferral = async (req, res) => {
  try {
    const { referral } = req.body;
    if (!referral) {
      return res
        .status(400)
        .json({ success: false, message: 'Referral code required' });
    }

    const students = await Student.find({ referral }).select(
      'firstName lastName'
    );

    const count = students.length;

    return res.status(200).json({
      success: true,
      count,
      students,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
