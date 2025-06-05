import Item from '../models/Item.js';
import uploadToS3 from '../utils/uploadToS3.js';

// Helper function to fix localhost URLs in image URLs
export function fixImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl;
  return imageUrl.replace('http://localhost:9000', 'http://192.168.254.29:9000');
}

// Helper function to fix image URLs in item object
export function fixItemImageUrl(item) {
  if (item.imageUrl) {
    item.imageUrl = fixImageUrl(item.imageUrl);
  }
  return item;
}

// GET /items
export async function getItems(req, res, next) {
  try {
    const { page = 1, limit = 10, q, location } = req.query;
    const filter = {};
    const options = {
      sort: { createdAt: -1 },
      skip: (page - 1) * parseInt(limit, 10),
      limit: parseInt(limit, 10),
    };

    // 텍스트 검색 최적화
    if (q) {
      // MongoDB text search 사용 (더 빠름)
      filter.$text = { $search: q };
      // 또는 regex 사용 (fallback)
      if (!filter.$text) {
        filter.$or = [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
        ];
      }
    }

    // 위치 필터 최적화
    if (location) {
      // 정확한 매치 우선, 그 다음 부분 매치
      filter.location = new RegExp(`^${location}|${location}`, 'i');
    }

    // 성능 측정 시작
    const startTime = Date.now();

    // 병렬로 데이터와 카운트 조회
    const [items, total] = await Promise.all([
      Item.find(filter, null, options).lean(), // .lean()으로 성능 향상
      Item.countDocuments(filter)
    ]);

    const queryTime = Date.now() - startTime;
    
    // 개발 환경에서 성능 로깅
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Query executed in ${queryTime}ms for ${total} items`);
    }

    // Fix image URLs for mobile access
    const fixedItems = items.map(fixItemImageUrl);

    res.json({
      data: fixedItems,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        queryTime, // 성능 모니터링용
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /items
export async function createItem(req, res, next) {
  try {
    const { title, description, location } = req.body;

    if (!title || !location) {
      return res.status(400).json({ message: 'Title and location are required.' });
    }

    let imageUrl;
    if (req.file) {
      try {
        const { url } = await uploadToS3(req.file);
        imageUrl = url;
      } catch (uploadErr) {
        console.error('Failed to upload to S3', uploadErr);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    // Get user email from Auth0 (with default fallback)
    let ownerEmail = 'rackoon1030@gmail.com'; // Default fallback
    if (req.auth && req.auth.sub) {
      // Extract email from Auth0 token
      ownerEmail = req.auth.email || req.auth['https://lostlink.app/email'] || 'rackoon1030@gmail.com';
    }
    
    console.log('📧 Item owner email:', ownerEmail);

    const item = new Item({
      title,
      description,
      location,
      imageUrl,
      ownerEmail, // Item owner's email address
      createdBy: req.auth?.sub // Auth0 user ID
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    next(err);
  }
}

// GET /items/:id
export async function getItemById(req, res, next) {
  try {
    const item = await Item.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate('claims');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Fix image URL for mobile access
    const fixedItem = fixItemImageUrl(item.toObject());

    res.json(fixedItem);
  } catch (err) {
    next(err);
  }
} 