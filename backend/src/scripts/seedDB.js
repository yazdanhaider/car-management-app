require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Car = require('../models/car');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create sample cars
    const cars = await Car.create([
      {
        title: 'Tesla Model S',
        description: 'Luxury electric sedan with amazing performance',
        tags: ['electric', 'luxury', 'sedan'],
        images: [
          'https://example.com/tesla-1.jpg',
          'https://example.com/tesla-2.jpg'
        ],
        owner: user._id
      },
      {
        title: 'BMW M3',
        description: 'High-performance sports car',
        tags: ['sports', 'luxury', 'performance'],
        images: [
          'https://example.com/bmw-1.jpg',
          'https://example.com/bmw-2.jpg'
        ],
        owner: user._id
      }
    ]);

    console.log('Database seeded successfully');
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedData(); 