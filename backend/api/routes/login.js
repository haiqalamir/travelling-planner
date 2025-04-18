// backend/api/routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const router = express.Router();

// POST /api/login
router.post('/', async (req, res) => {
  try {
    const { identifier, password } = req.body;  // identifier: either username or email
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    // Find a user by username or email
    const user = await User.findOne({ $or: [ { email: identifier }, { username: identifier } ] });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    
    // Compare the password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    
    // In production, you may issue a JWT token for session management.
    res.status(200).json({ message: 'Login successful.', userId: user._id, customerId: user.customerId });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
