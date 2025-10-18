const express = require('express');
const app = express();

const userRoutes = require('./routes/User');
const userProfile = require('./routes/Profile');
const studentRoutes = require('./routes/student');
const internRoutes = require('./routes/intern');
const countryRoutes = require('./routes/County');
const referralRoutes = require('./routes/referralRoutes');
const GstuRegistrationRoutes = require('./routes/GstuRegistrationRoutes');

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

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://fly8-v1.vercel.app',
        'https://fly8.global',
        'https://www.fly8.global',
        'http://localhost:8080',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'], // If using cookies
  })
);
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

//def route
app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Your server is up and running....',
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
