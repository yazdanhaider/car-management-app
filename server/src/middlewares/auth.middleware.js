import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { User } from '../models/user.model.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    throw new AppError('Please log in to access this resource', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('User not found', 401);
  }

  req.user = user;
  next();
}); 