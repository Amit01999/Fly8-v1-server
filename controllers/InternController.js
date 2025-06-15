const Intern = require('../models/intern');
const submitInternApplication = async (req, res) => {
  try {
    const newApplication = new Intern(req.body);
    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  submitInternApplication,
};
