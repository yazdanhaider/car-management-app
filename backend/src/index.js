require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const docsRoutes = require('./routes/docs');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
app.use(express.json());
app.use(cookieParser());

// Security middleware
app.use(require('helmet')());
app.use(require('express-rate-limit')({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/docs', docsRoutes);

// Error handling
app.use(errorHandler);

// Function to start server
const startServer = async (retries = 5) => {
  const PORT = process.env.PORT || 5000;
  
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying to kill the process...`);
        
        const exec = require('child_process').exec;
        exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, async (err) => {
          if (err && retries > 0) {
            console.log(`Retrying with port ${PORT + 1}...`);
            process.env.PORT = PORT + 1;
            await startServer(retries - 1);
          } else if (retries === 0) {
            console.error('Failed to start server after multiple retries');
            process.exit(1);
          }
        });
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    if (retries > 0) {
      console.log(`Retrying with port ${PORT + 1}...`);
      process.env.PORT = PORT + 1;
      await startServer(retries - 1);
    } else {
      process.exit(1);
    }
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer(); 