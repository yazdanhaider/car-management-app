import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createCar,
  getCars,
  getCar,
  updateCar,
  deleteCar
} from '../controllers/car.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCars)
  .post(createCar);

router.route('/:id')
  .get(getCar)
  .patch(updateCar)
  .delete(deleteCar);

export default router; 