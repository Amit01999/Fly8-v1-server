import express from 'express';
import { submitInternApplication } from '../controllers/InternController.js';

const router = express.Router();

router.post('/apply', submitInternApplication);

export default router;
