import express from 'express';
import { getItems, createItem, getItemById } from '../controllers/itemController.js';
import { createClaim } from '../controllers/claimController.js';

const router = express.Router();

router.get('/', getItems);
router.post('/', createItem);

router.get('/:id', getItemById);
router.post('/:id/claim', createClaim);

export default router; 