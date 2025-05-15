import Item from '../models/Item.js';
import uploadToS3 from '../utils/uploadToS3.js';

// GET /items
export async function getItems(req, res, next) {
  try {
    const { page = 1, limit = 10, q, location } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
      ];
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Item.countDocuments(filter);

    res.json({
      data: items,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
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

    const item = new Item({
      title,
      description,
      location,
      imageUrl,
      // createdBy: req.user?.id // TODO: after adding Auth middleware
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
    const item = await Item.findById(req.params.id).populate('createdBy', 'email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
} 