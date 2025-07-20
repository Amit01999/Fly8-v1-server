const Country = require('../models/Country');

exports.getCountryDetails = async (req, res) => {
  try {
    const { countryname } = req.query;

    const countryDetails = await Country.findOne({ code: countryname });

    if (!countryDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find country with code: ${countryname}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: countryDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
