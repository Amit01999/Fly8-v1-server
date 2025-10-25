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
const adminRoutes = require('./routes/admin');

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

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`Left conversation: ${conversationId}`);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.conversationId).emit('user-stop-typing', {
      userId: data.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);
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
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/admin', adminRoutes);

//def route
app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Your server is up and running....',
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
  console.log('Socket.io is ready for real-time connections');
});
