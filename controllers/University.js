const University = require('../models/universities');

// CREATE - Add a new university
exports.createUniversity = async (req, res) => {
  try {
    const { universitycode, universityName, country } = req.body;

    // Validate required fields
    if (!universitycode || !universityName || !country) {
      return res.status(400).json({
        success: false,
        message:
          'universitycode, universityName, and country are required fields',
      });
    }

    // Check if university with same code already exists
    const existingUniversity = await University.findOne({ universitycode });
    if (existingUniversity) {
      return res.status(400).json({
        success: false,
        message: `University with code '${universitycode}' already exists`,
      });
    }

    // Create new university
    const university = new University(req.body);
    await university.save();

    return res.status(201).json({
      success: true,
      message: 'University created successfully',
      data: university,
    });
  } catch (error) {
    console.error('Error creating university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create university',
      error: error.message,
    });
  }
};

// READ - Get all universities
exports.getAllUniversities = async (req, res) => {
  try {
    const { country, search, limit, page } = req.query;

    // Build filter object
    const filter = {};
    if (country) {
      filter.country = country;
    }
    if (search) {
      filter.$or = [
        { universityName: { $regex: search, $options: 'i' } },
        { universitycode: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const universities = await University.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await University.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Universities retrieved successfully',
      data: universities,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch universities',
      error: error.message,
    });
  }
};

// READ - Get single university by ID
exports.getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University not found with id: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: university,
    });
  } catch (error) {
    console.error('Error fetching university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch university',
      error: error.message,
    });
  }
};

// READ - Get single university by code
exports.getUniversityByCode = async (req, res) => {
  try {
    const { universitycode } = req.params;

    const university = await University.findOne({ universitycode });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University not found with code: ${universitycode}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: university,
    });
  } catch (error) {
    console.error('Error fetching university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch university',
      error: error.message,
    });
  }
};

// UPDATE - Update university
exports.updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if university exists
    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University not found with id: ${id}`,
      });
    }

    // If updating universitycode, check for duplicates
    if (
      req.body.universitycode &&
      req.body.universitycode !== university.universitycode
    ) {
      const existingUniversity = await University.findOne({
        universitycode: req.body.universitycode,
      });
      if (existingUniversity) {
        return res.status(400).json({
          success: false,
          message: `University with code '${req.body.universitycode}' already exists`,
        });
      }
    }

    // Update university
    const updatedUniversity = await University.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'University updated successfully',
      data: updatedUniversity,
    });
  } catch (error) {
    console.error('Error updating university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update university',
      error: error.message,
    });
  }
};

// UPDATE - Update university by code
exports.updateUniversityByCode = async (req, res) => {
  try {
    const { universitycode } = req.params;

    // Check if university exists
    const university = await University.findOne({ universitycode });
    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University not found with code: ${universitycode}`,
      });
    }

    // Update university
    const updatedUniversity = await University.findOneAndUpdate(
      { universitycode },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'University updated successfully',
      data: updatedUniversity,
    });
  } catch (error) {
    console.error('Error updating university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update university',
      error: error.message,
    });
  }
};

// DELETE - Delete university
exports.deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University not found with id: ${id}`,
      });
    }

    await University.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'University deleted successfully',
      data: university,
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete university',
      error: error.message,
    });
  }
};

// DELETE - Delete university by code
exports.deleteUniversityByCode = async (req, res) => {
  try {
    const { universitycode } = req.params;

    const university = await University.findOne({ universitycode });
    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University not found with code: ${universitycode}`,
      });
    }

    await University.findOneAndDelete({ universitycode });

    return res.status(200).json({
      success: true,
      message: 'University deleted successfully',
      data: university,
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete university',
      error: error.message,
    });
  }
};

// GET - Get universities by country
exports.getUniversitiesByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    console.log('Fetching universities for country:', country);

    // Create a normalized version of the country name (remove spaces, lowercase)
    const normalizedCountry = country.toLowerCase().trim();

    // Try multiple matching strategies
    // 1. Exact case-insensitive match
    // 2. Match with spaces removed (e.g., "New Zealand" -> "newzealand")
    // 3. Match with hyphens instead of spaces (e.g., "New Zealand" -> "new-zealand")
    // 4. Handle common variations (e.g., "United States" -> "usa", "UK" -> "united kingdom")

    const countryVariations = [
      country, // Original
      normalizedCountry, // Lowercase
      normalizedCountry.replace(/\s+/g, ''), // No spaces
      normalizedCountry.replace(/\s+/g, '-'), // Hyphens instead of spaces
    ];

    // Add specific country mappings
    const countryMappings = {
      'united states': ['usa', 'united states', 'us', 'unitedstates'],
      'usa': ['usa', 'united states', 'us', 'unitedstates'],
      'uk': ['uk', 'united kingdom', 'unitedkingdom'],
      'united kingdom': ['uk', 'united kingdom', 'unitedkingdom'],
      'uae': ['uae', 'united arab emirates', 'unitedarabemirates'],
      'united arab emirates': ['uae', 'united arab emirates', 'unitedarabemirates'],
      'new zealand': ['new zealand', 'newzealand'],
      'newzealand': ['new zealand', 'newzealand'],
      'south korea': ['south korea', 'southkorea', 'korea'],
      'southkorea': ['south korea', 'southkorea', 'korea'],
      'czech republic': ['czech republic', 'czechrepublic', 'czech-republic'],
      'czechrepublic': ['czech republic', 'czechrepublic', 'czech-republic'],
      'hong kong': ['hong kong', 'hongkong'],
      'hongkong': ['hong kong', 'hongkong'],
    };

    // Get all possible variations for this country
    const allVariations = countryMappings[normalizedCountry] || countryVariations;

    // Build regex pattern that matches any variation
    const regexPattern = allVariations.map(v => `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).join('|');

    console.log('Searching with variations:', allVariations);

    let universities = await University.find({
      country: { $regex: new RegExp(regexPattern, 'i') },
    }).sort({ universityName: 1 });

    // If no exact matches found, try a partial match (contains)
    if (universities.length === 0) {
      console.log('No exact matches found, trying partial match...');
      universities = await University.find({
        country: { $regex: new RegExp(country, 'i') },
      }).sort({ universityName: 1 });
    }

    console.log(`Found ${universities.length} universities for ${country}`);

    return res.status(200).json({
      success: true,
      message: `Found ${universities.length} universities in ${country}`,
      data: universities,
      count: universities.length,
    });
  } catch (error) {
    console.error('Error fetching universities by country:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch universities',
      error: error.message,
    });
  }
};

// GET - Get university statistics
exports.getUniversityStats = async (req, res) => {
  try {
    const total = await University.countDocuments();
    const byCountry = await University.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUniversities: total,
        universitiesByCountry: byCountry,
      },
    });
  } catch (error) {
    console.error('Error fetching university statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};
