const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'contact@fly8.global' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);

      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question(
        'Do you want to reset the password? (yes/no): ',
        async answer => {
          if (answer.toLowerCase() === 'yes') {
            const hashedPassword = await bcrypt.hash('StudentAdmin@Fly8', 10);
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('✅ Password reset to: StudentAdmin@Fly8');
          } else {
            console.log('Operation cancelled');
          }
          readline.close();
          mongoose.disconnect();
        }
      );

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('StudentAdmin@Fly8', 10);

    // Create student admin
    const admin = await Admin.create({
      firstName: 'Student',
      lastName: 'Admin',
      email: 'contact@fly8.global',
      password: hashedPassword,
      role: 'student-admin',
      permissions: {
        students: { view: true, create: true, edit: true, delete: true },
        messages: { view: true, send: true, delete: true },
        appointments: { view: true, create: true, edit: true, delete: true },
        notifications: { view: true, send: true, delete: true },
        feedback: { view: true, respond: true },
        analytics: { view: true },
      },
      isActive: true,
    });

    console.log('✅ Student Admin created successfully!');
    console.log('========================================');
    console.log('Admin Credentials:');
    console.log('========================================');
    console.log('Email:    contact@fly8.global');
    console.log('Password: StudentAdmin@Fly8');
    console.log('Role:     student-admin');
    console.log('========================================');
    console.log('');
    console.log(
      '⚠️  IMPORTANT: Please change these credentials after your first login!'
    );
    console.log('');

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdmin();
