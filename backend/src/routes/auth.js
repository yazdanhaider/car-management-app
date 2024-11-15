const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { signupSchema, loginSchema } = require('../validations/auth');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../middleware/errorHandler');
const router = express.Router();

const cookieOptions = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

// Signup
router.post('/signup', catchAsync(async (req, res, next) => {
  const validatedData = signupSchema.parse(req.body);
  
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) {
    throw new AppError('Email already exists', 400);
  }

  const user = new User(validatedData);
  await user.save();

  const token = user.generateAuthToken();
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  // Set JWT cookie
  res.cookie('jwt', token, cookieOptions);

  res.status(201).json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
}));

// Login
router.post('/login', catchAsync(async (req, res, next) => {
  const validatedData = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validatedData.email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(validatedData.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = user.generateAuthToken();
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  // Set JWT cookie
  res.cookie('jwt', token, cookieOptions);

  res.json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
}));

// Logout
router.get('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
});

// Get current user
router.get('/me', auth, catchAsync(async (req, res) => {
  const userResponse = req.user.toObject();
  delete userResponse.password;
  
  res.json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
}));

module.exports = router; 