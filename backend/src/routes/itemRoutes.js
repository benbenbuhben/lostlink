import express from 'express';
import { getItems, createItem, getItemById } from '../controllers/itemController.js';
import { createClaim } from '../controllers/claimController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getItems);
router.post('/', upload.single('image'), createItem);

router.get('/:id', getItemById);
router.post('/:id/claim', createClaim);

export default router; 