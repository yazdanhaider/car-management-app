import { Car } from '../models/car.model.js';
import { AppError } from '../middlewares/errorHandler.js';
import { carSchema } from '../schemas/car.schema.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createCar = catchAsync(async (req, res) => {
  const validatedData = carSchema.parse(req.body);
  const car = await Car.create({
    ...validatedData,
    user: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: { car }
  });
});

export const getCars = catchAsync(async (req, res) => {
  const { search } = req.query;
  let query = { user: req.user._id };

  if (search) {
    query.$text = { $search: search };
  }

  const cars = await Car.find(query);
  res.status(200).json({
    status: 'success',
    data: { cars }
  });
});

export const getCar = catchAsync(async (req, res) => {
  const car = await Car.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { car }
  });
});

export const updateCar = catchAsync(async (req, res) => {
  const validatedData = carSchema.parse(req.body);
  const car = await Car.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    validatedData,
    { new: true, runValidators: true }
  );

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { car }
  });
});

export const deleteCar = catchAsync(async (req, res) => {
  const car = await Car.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
}); 