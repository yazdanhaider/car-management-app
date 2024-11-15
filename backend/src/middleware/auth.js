const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { AppError } = require('./errorHandler');
const catchAsync = require('../utils/catchAsync');

const auth = catchAsync(async (req, res, next) => {
  try {
    // 1) Get token from cookie or header
    let token;
    
    console.log('Cookies received:', req.cookies);  // Log all cookies
    console.log('Authorization header:', req.headers.authorization);  // Log auth header

    // First try to get token from cookies
    if (req.cookies && req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
      console.log('Token found in cookies:', req.cookies.jwt);
      token = req.cookies.jwt;
    } 
    // Then try Authorization header as fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header:', token);
    }

    if (!token) {
      console.error('Authentication Error: No valid token found in cookies or headers');
      throw new AppError('Please log in to access this resource', 401);
    }

    // 2) Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.error('JWT Verification Error:', {
        error: error.message,
        token: token,
        secret: process.env.JWT_SECRET ? 'Secret exists' : 'Secret missing'
      });
      throw new AppError('Invalid or expired token', 401);
    }

    // 3) Check if user still exists
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      console.error('Authentication Error: User not found for decoded token:', {
        decodedId: decoded.id,
        token: token
      });
      throw new AppError('The user belonging to this token no longer exists', 401);
    }

    console.log('Authentication successful for user:', user.email);

    // Grant access to protected route
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', {
      error: error.message,
      stack: error.stack,
      cookies: req.cookies,
      headers: req.headers
    });
    next(error);
  }
});

module.exports = auth; 