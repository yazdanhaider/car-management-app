class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = err => {
  console.error('Database Cast Error:', err);
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  console.error('Database Duplicate Field Error:', err);
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  console.error('Database Validation Error:', err);
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = err => {
  console.error('JWT Error:', err);
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = err => {
  console.error('JWT Expired Error:', err);
  return new AppError('Your token has expired! Please log in again.', 401);
};

const sendErrorDev = (err, res) => {
  console.error('Development Error:', {
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    console.error('Production Operational Error:', {
      status: err.status,
      message: err.message
    });

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('Production Programming Error:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  console.error('Error Handler Received:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
    if (error.name === 'ZodError') {
      console.error('Zod Validation Error:', error.errors);
      error = new AppError('Validation Error: ' + error.errors[0].message, 400);
    }

    sendErrorProd(error, res);
  }
};

module.exports = { AppError, errorHandler }; 