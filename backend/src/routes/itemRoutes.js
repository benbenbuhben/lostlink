import express from 'express';
import { getItems, createItem, getItemById, fixItemImageUrl } from '../controllers/itemController.js';
import { createClaim, updateClaimStatus } from '../controllers/claimController.js';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import Item from '../models/Item.js';

const router = express.Router();

// GET /items/search - Search items with query and location
router.get('/search', async (req, res) => {
  try {
    const { query, location, page = 1, limit = 20 } = req.query;
    const filter = {};
    const options = {
      sort: { createdAt: -1 },
      skip: (page - 1) * parseInt(limit, 10),
      limit: parseInt(limit, 10),
    };

    const startTime = Date.now();

    // Text search optimization
    if (query && query.trim()) {
      filter.$or = [
        { title: new RegExp(query.trim(), 'i') },
        { description: new RegExp(query.trim(), 'i') },
      ];
    }

    // Location filter optimization
    if (location && location.trim()) {
      filter.location = new RegExp(location.trim(), 'i');
    }

    console.log('🔍 Search filter:', filter);

    // Execute search with parallel queries
    const [items, total] = await Promise.all([
      Item.find(filter, null, options).lean(),
      Item.countDocuments(filter)
    ]);

    const queryTime = Date.now() - startTime;
    
    console.log(`✅ Search completed in ${queryTime}ms - Found ${total} items`);

    // Fix image URLs for mobile access
    const fixedItems = items.map(fixItemImageUrl);

    res.json({
      data: fixedItems,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        queryTime,
      },
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message,
      data: [],
      pagination: { total: 0, page: 1, limit: 20 }
    });
  }
});

// GET /items/locations - Get list of used locations
router.get('/locations', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get unique locations from items, excluding empty values
    const locations = await Item.distinct('location', { 
      location: { $exists: true, $ne: '', $ne: null } 
    });
    
    // Sort alphabetically and limit to most common ones
    const sortedLocations = locations
      .filter(loc => loc && loc.trim().length > 0)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .slice(0, 20); // Limit to 20 most recent locations
    
    const queryTime = Date.now() - startTime;
    
    console.log(`📍 Found ${sortedLocations.length} unique locations in ${queryTime}ms`);
    
    res.json({
      data: sortedLocations,
      total: sortedLocations.length,
      source: 'database',
      queryTime
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch locations',
      data: [], // Return empty array as fallback
      total: 0,
      source: 'error'
    });
  }
});

router.get('/', getItems);
router.post('/', authenticate, upload.single('image'), createItem);

router.get('/:id', getItemById);
router.post('/:id/claim', createClaim);

// PUT /items/:itemId/claim/:claimId/status - Update claim status
router.put('/:itemId/claim/:claimId/status', (req, res, next) => {
  // Set claimId to params
  req.params.id = req.params.claimId;
  updateClaimStatus(req, res, next);
});

export default router; 