const express = require('express');
const app = express();

const userRoutes = require('./routes/User');

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
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

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
