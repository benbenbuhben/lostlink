import express from 'express';
import { getItems, createItem, getItemById } from '../controllers/itemController.js';
import { createClaim } from '../controllers/claimController.js';
import upload from '../middleware/upload.js';
import Item from '../models/Item.js';

const router = express.Router();

// GET /items/locations - 사용 중인 위치 목록 반환
router.get('/locations', async (req, res) => {
  try {
    // 실제 데이터베이스에서 사용된 위치들을 집계
    const locations = await Item.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // 기본 인기 위치 목록 (데이터가 없을 때 사용)
    const defaultLocations = [
      'Library', 'Cafeteria', 'Gym', 'Classroom', 'Parking Lot', 
      'Student Center', 'Dormitory', 'Bus Stop', 'Campus Store'
    ];

    // 실제 데이터가 있으면 사용하고, 없으면 기본값 사용
    const popularLocations = locations.length > 0 
      ? locations.map(loc => loc._id).filter(Boolean)
      : defaultLocations;

    res.json({
      data: popularLocations,
      total: popularLocations.length,
      source: locations.length > 0 ? 'database' : 'default'
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    
    // 오류 시 기본 위치 목록 반환
    const defaultLocations = [
      'Library', 'Cafeteria', 'Gym', 'Classroom', 'Parking Lot', 
      'Student Center', 'Dormitory', 'Bus Stop', 'Campus Store'
    ];
    
    res.json({
      data: defaultLocations,
      total: defaultLocations.length,
      source: 'fallback'
    });
  }
});

router.get('/', getItems);
router.post('/', upload.single('image'), createItem);

router.get('/:id', getItemById);
router.post('/:id/claim', createClaim);

export default router; 