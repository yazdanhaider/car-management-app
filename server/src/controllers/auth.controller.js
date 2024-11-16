import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { AppError } from '../middlewares/errorHandler.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { catchAsync } from '../utils/catchAsync.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: 'localhost',
  path: '/'
};

export const register = catchAsync(async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      throw new AppError('Email already exists', 400);
    }

    const user = await User.create(validatedData);
    const token = signToken(user._id);

    user.password = undefined;

    res.cookie('token', token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.status(201).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
});

export const login = catchAsync(async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user || !(await user.comparePassword(validatedData.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.cookie('token', token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
});

export const logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    ...cookieOptions,
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.status(200).json({ status: 'success' });
};

export const getCurrentUser = catchAsync(async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    throw new AppError('Not authenticated', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      throw new AppError('Not authenticated', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Not authenticated'
    });
  }
}); 