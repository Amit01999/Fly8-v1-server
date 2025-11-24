const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const userRoutes = require('./routes/User');
const userProfile = require('./routes/Profile');
const studentRoutes = require('./routes/student');
const internRoutes = require('./routes/intern');
const countryRoutes = require('./routes/County');
const referralRoutes = require('./routes/referralRoutes');
const GstuRegistrationRoutes = require('./routes/GstuRegistrationRoutes');
const germanCourseRoutes = require('./routes/GermanCourseRoutes');
const adminRoutes = require('./routes/admin');
const universityRoutes = require('./routes/university');
const programRoutes = require('./routes/program');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { cloudinaryConnect } = require('./config/cloudinary');
const dotenv = require('dotenv');
const blogRoutes = require('./routes/blogRoutes');

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

// CORS configuration
const allowedOrigins = [
  'https://fly8-v1.vercel.app',
  'https://admin.fly8.global',
  'https://fly8.global',
  'https://www.fly8.global',
  'http://localhost:8080',
  'http://localhost:8081', // For local admin panel development
  'http://localhost:5173', // For local admin panel development
  'http://localhost:5174', // For local client development
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Import socket handlers
const socketHandlers = require('./socket/handlers');

// Socket.io connection handler with authentication
io.use((socket, next) => {
  // Extract user info from handshake (set by client)
  const { userId, userType } = socket.handshake.auth;

  if (userId) {
    socket.userId = userId;
    socket.userType = userType || 'student';
    next();
  } else {
    // Allow connection but log warning
    console.warn('Socket connected without authentication');
    next();
  }
});

// Handle socket connections with modular handlers
io.on('connection', socket => {
  console.log(
    `Socket connected: ${socket.id}, User: ${socket.userId || 'anonymous'}`
  );

  // Initialize all socket event handlers
  socketHandlers(io, socket);
});

// Make io accessible to routes and controllers
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Conditional fileUpload middleware - skip for blog routes that use multer
app.use((req, res, next) => {
  // Skip fileUpload middleware for blog routes (they use multer)
  if (req.path.startsWith('/api/v1/blog')) {
    return next();
  }

  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })(req, res, next);
});

//cloudinary connection
cloudinaryConnect();

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', userProfile);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/country', countryRoutes);
app.use('/api/v1/intern', internRoutes);
app.use('/api/v1/referral', referralRoutes);
app.use('/api/v1/gstu', GstuRegistrationRoutes);
app.use('/api/v1/german-course', germanCourseRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', universityRoutes);
app.use('/api/v1', programRoutes);

//def route
app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Your server is up and running....',
    version: '1.0.1', // Added to trigger deployment
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
  console.log('Socket.io is ready for real-time connections');
});
