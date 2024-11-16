import express from 'express';
import { getDocs } from '../controllers/docs.controller.js';

const router = express.Router();

router.get('/', getDocs);

export default router; 