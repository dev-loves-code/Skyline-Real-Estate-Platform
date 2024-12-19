const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../utils/database');


function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Please log in.',
    });
  }
}


router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE name = ? OR email = ?',
      [name, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.post('/signin', async (req, res) => {
  const { name, password } = req.body;

  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE name = ?',
      [name]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.user = { id: user.id, name: user.name, role: user.role };

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to log out. Please try again.',
      });
    }
    res.clearCookie('user_sid'); 
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});


router.get('/protected', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.session.user,
  });
});

module.exports = router;
