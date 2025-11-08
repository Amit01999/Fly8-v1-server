const Program = require('../models/program');

// CREATE - Add a new program
exports.createProgram = async (req, res) => {
  try {
    const {
      country,
      universityName,
      location,
      programName,
      majors,
      programLevel,
      duration,
      intake,
    } = req.body;

    // Validate required fields
    if (
      !country ||
      !universityName ||
      !location ||
      !programName ||
      !majors ||
      !programLevel ||
      !duration ||
      !intake
    ) {
      return res.status(400).json({
        success: false,
        message:
          'country, universityName, location, programName, majors, programLevel, duration, and intake are required fields',
      });
    }

    // Create new program
    const program = new Program(req.body);
    await program.save();

    return res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program,
    });
  } catch (error) {
    console.error('Error creating program:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create program',
      error: error.message,
    });
  }
};

// READ - Get all programs with filters and pagination
exports.getAllPrograms = async (req, res) => {
  try {
    const {
      country,
      universityName,
      programLevel,
      majors,
      search,
      limit,
      page,
    } = req.query;

    // Build filter object
    const filter = {};
    if (country) {
      filter.country = { $regex: new RegExp(country, 'i') };
    }
    if (universityName) {
      filter.universityName = { $regex: new RegExp(universityName, 'i') };
    }
    if (programLevel) {
      filter.programLevel = programLevel;
    }
    if (majors) {
      filter.majors = { $regex: new RegExp(majors, 'i') };
    }
    if (search) {
      filter.$or = [
        { programName: { $regex: search, $options: 'i' } },
        { majors: { $regex: search, $options: 'i' } },
        { universityName: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const programs = await Program.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Program.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Programs retrieved successfully',
      data: programs,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message,
    });
  }
};

// READ - Get single program by ID
exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Program not found with id: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch program',
      error: error.message,
    });
  }
};

// READ - Get programs by country
exports.getProgramsByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    // Country name normalization (same as university controller)
    const normalizedCountry = country.toLowerCase().trim();

    const countryVariations = [
      country,
      normalizedCountry,
      normalizedCountry.replace(/\s+/g, ''),
      normalizedCountry.replace(/\s+/g, '-'),
    ];

    const countryMappings = {
      'united states': ['usa', 'united states', 'us', 'unitedstates'],
      usa: ['usa', 'united states', 'us', 'unitedstates'],
      uk: ['uk', 'united kingdom', 'unitedkingdom'],
      'united kingdom': ['uk', 'united kingdom', 'unitedkingdom'],
      uae: ['uae', 'united arab emirates', 'unitedarabemirates'],
      'united arab emirates': [
        'uae',
        'united arab emirates',
        'unitedarabemirates',
      ],
      'new zealand': ['new zealand', 'newzealand'],
      newzealand: ['new zealand', 'newzealand'],
      'south korea': ['south korea', 'southkorea', 'korea'],
      southkorea: ['south korea', 'southkorea', 'korea'],
    };

    const allVariations =
      countryMappings[normalizedCountry] || countryVariations;
    const regexPattern = allVariations
      .map(v => `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
      .join('|');

    let programs = await Program.find({
      country: { $regex: new RegExp(regexPattern, 'i') },
    }).sort({ programName: 1 });

    if (programs.length === 0) {
      programs = await Program.find({
        country: { $regex: new RegExp(country, 'i') },
      }).sort({ programName: 1 });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${programs.length} programs in ${country}`,
      data: programs,
      count: programs.length,
    });
  } catch (error) {
    console.error('Error fetching programs by country:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message,
    });
  }
};

// READ - Get programs by university
exports.getProgramsByUniversity = async (req, res) => {
  try {
    const { universityName } = req.params;

    const programs = await Program.find({
      universityName: { $regex: new RegExp(universityName, 'i') },
    }).sort({ programLevel: 1, programName: 1 });

    return res.status(200).json({
      success: true,
      message: `Found ${programs.length} programs for ${universityName}`,
      data: programs,
      count: programs.length,
    });
  } catch (error) {
    console.error('Error fetching programs by university:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message,
    });
  }
};

// READ - Get programs by level
exports.getProgramsByLevel = async (req, res) => {
  try {
    const { level } = req.params;

    const programs = await Program.find({
      programLevel: level,
    }).sort({ universityName: 1, programName: 1 });

    return res.status(200).json({
      success: true,
      message: `Found ${programs.length} ${level} programs`,
      data: programs,
      count: programs.length,
    });
  } catch (error) {
    console.error('Error fetching programs by level:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message,
    });
  }
};

// UPDATE - Update program
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists
    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Program not found with id: ${id}`,
      });
    }

    // Update program
    const updatedProgram = await Program.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      data: updatedProgram,
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update program',
      error: error.message,
    });
  }
};

// DELETE - Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Program not found with id: ${id}`,
      });
    }

    await Program.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Program deleted successfully',
      data: program,
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete program',
      error: error.message,
    });
  }
};

// GET - Program statistics
exports.getProgramStats = async (req, res) => {
  try {
    const total = await Program.countDocuments();

    const byCountry = await Program.aggregate([
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

    const byLevel = await Program.aggregate([
      {
        $group: {
          _id: '$programLevel',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const byUniversity = await Program.aggregate([
      {
        $group: {
          _id: '$universityName',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPrograms: total,
        programsByCountry: byCountry,
        programsByLevel: byLevel,
        topUniversities: byUniversity,
      },
    });
  } catch (error) {
    console.error('Error fetching program statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};
