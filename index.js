const express = require('express');
const app = express();

const userRoutes = require('./routes/User');
const userProfile = require('./routes/Profile');
const internRoutes = require('./routes/intern');
const countryRoutes = require('./routes/County');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { cloudinaryConnect } = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         'https://fly8-v1.vercel.app',
//         'https://fly8.global', // ✅ Add your custom domain here
//         'https://www.fly8.global', // ✅ Optionally include www version if needed
//         'http://localhost:8080',
//       ];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );
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
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true, //this middeare is for fileupload in local media;
    tempFileDir: '/tmp',
  })
);
//cloudinary connection
cloudinaryConnect();

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', userProfile);
app.use('/api/v1/country', countryRoutes);
app.use('/api/v1/intern', internRoutes);

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
