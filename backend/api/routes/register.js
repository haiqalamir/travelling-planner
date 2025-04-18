// backend/api/routes/register.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Customer = require('../../models/Customer');
const User = require('../../models/User');
const router = express.Router();

// POST /api/register
router.post('/', async (req, res) => {
  try {
    const { email, username, password, confirmPassword, name, phoneNumber, address } = req.body;
    
    // Validate required fields
    if (!email || !username || !password || !confirmPassword || !name || !phoneNumber || !address) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    
    // Check for an existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email or username already exists.' });
    }
    
    // Create a Customer record
    const newCustomer = new Customer({
      name,
      address,
      phoneNumber
    });
    const savedCustomer = await newCustomer.save();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create a User record that references the Customer document
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      customerId: savedCustomer._id
    });
    await newUser.save();
    
    res.status(201).json({ message: 'Registration successful.' });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
