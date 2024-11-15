const express = require('express');
const auth = require('../middleware/auth');
const Car = require('../models/car');
const { carSchema } = require('../validations/car');
const router = express.Router();

// Get all cars for authenticated user with sorting and filtering
router.get('/', auth, async (req, res, next) => {
  try {
    const { sort, order, tags } = req.query;
    let query = { owner: req.user._id };

    // Add tag filtering if provided
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $all: tagArray };
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // default sort
    if (sort) {
      sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    }

    const cars = await Car.find(query).sort(sortObj);
    res.json(cars);
  } catch (error) {
    next(error);
  }
});

// Search cars
router.get('/search', auth, async (req, res, next) => {
  try {
    const { q, tags } = req.query;
    let query = {
      owner: req.user._id,
    };

    // Only add text search if query is not empty
    if (q && q.trim() !== '') {
      query.$text = { $search: q };
    }

    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $all: tagArray };
    }

    // If no search query, return all cars sorted by creation date
    const cars = q && q.trim() !== ''
      ? await Car.find(query).sort({ score: { $meta: 'textScore' } })
      : await Car.find(query).sort({ createdAt: -1 });
    
    res.json(cars);
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
});

// Get single car
router.get('/:id', auth, async (req, res, next) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    next(error);
  }
});

// Create car
router.post('/', auth, async (req, res, next) => {
  try {
    const validatedData = carSchema.parse(req.body);
    
    const car = new Car({
      ...validatedData,
      owner: req.user._id
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    next(error);
  }
});

// Update car
router.put('/:id', auth, async (req, res, next) => {
  try {
    const validatedData = carSchema.parse(req.body);
    
    const car = await Car.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    Object.assign(car, validatedData);
    await car.save();
    res.json(car);
  } catch (error) {
    next(error);
  }
});

// Delete car
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const car = await Car.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 