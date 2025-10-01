// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/interviews', interviewRoutes);

// Connect to MongoDB (remove deprecated options)
mongoose.connect('mongodb://localhost:27017/swipeintern')
  .then(() => app.listen(5000, () => console.log('Server running on port 5000')))
  .catch((err) => console.log(err));
