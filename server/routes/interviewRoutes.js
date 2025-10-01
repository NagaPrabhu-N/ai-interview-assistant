const express = require('express');
const Interview = require('../models/Interview');
const router = express.Router();

// Save interview session
router.post('/', async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json(interview);
  } catch (e) {
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
