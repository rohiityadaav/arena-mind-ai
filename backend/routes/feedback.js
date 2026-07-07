const express = require('express');
const router = express.Router();
const { dbRun, generateUuid } = require('../database');

router.post('/', async (req, res) => {
  const { session_id, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating is required and must be between 1 and 5' });
  }

  try {
    const id = generateUuid();
    await dbRun(`
      INSERT INTO feedback (id, session_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [id, session_id || null, rating, comment || '']);

    res.status(201).json({ id, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
