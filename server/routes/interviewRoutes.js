const express = require('express');
const Interview = require('../models/Interview');
const router = express.Router();

// Save interview session
// Save interview session
router.post('/', async (req, res) => {
  console.log('Received POST request to /api/interviews with data:', req.body); // Log incoming data
  try {
    const interview = new Interview(req.body);
    await interview.save();
    console.log('Successfully saved interview to DB:', interview); // Log success
    res.status(201).json(interview);
  } catch (e) {
    console.error('Error saving to DB:', e.message); // Log errors
    res.status(500).json({error: e.message});
  }
});

// Get all interviews (for admin)
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json(interviews);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

module.exports = router;
