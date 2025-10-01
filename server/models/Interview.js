const mongoose = require('mongoose');
const InterviewSchema = new mongoose.Schema({
  candidateName: String,
  email: String,
  phone: String,
  questions: Array,
  answers: Array,
  score: Number,
  summary: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Interview', InterviewSchema);
