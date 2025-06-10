import Item from '../models/Item.js';
import uploadToS3 from '../utils/uploadToS3.js';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

const rekognition = new RekognitionClient({ region: process.env.AWS_REGION });

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

// Detect up to 4 high-confidence labels and return them lower-cased
async function detectTags(buffer) {
  const cmd = new DetectLabelsCommand({
    Image: { Bytes: buffer },
    MaxLabels: 10,
    MinConfidence: 80,
  });
  const { Labels = [] } = await rekognition.send(cmd);
  return Labels
    .filter(l => l.Confidence >= 80)
    .slice(0, 4)
    .map(l => l.Name.toLowerCase());
}

// GET /items
export async function getItems(req, res, next) {
  try {
    const { page = 1, limit = 10, q, location } = req.query;
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const start = Date.now();

    /* -----------------------------------------------------------
       0)  Plain feed (no query)  -->  newest first, optional location
    ----------------------------------------------------------- */
    if (!q || !q.trim()) {
      const baseFilter = location
        ? { location: new RegExp(`^${location}|${location}`, 'i') }
        : {};

      const [items, total] = await Promise.all([
        Item.find(baseFilter, null, {
          sort:  { createdAt: -1 },
          skip:  (pageNum - 1) * limitNum,
          limit: limitNum,
        }).lean(),
        Item.countDocuments(baseFilter),
      ]);

      return res.json({
        data: items.map(fixItemImageUrl),
        pagination: {
          total,
          page:  pageNum,
          limit: limitNum,
          queryTime: Date.now() - start,
        },
      });
    }
    
    let textHits = [];
    let regexHits = [];

    /* ---------- base match objects ---------- */
    const locFilter = location
      ? { location: new RegExp(`^${location}|${location}`, 'i') }
      : {};

    /* ---------- 1) full-text search ---------- */
    if (q && q.trim().length >= 3) {
      textHits = await Item.find(
        { ...locFilter, $text: { $search: q.trim() } },
        { score: { $meta: 'textScore' } },
        { skip: (pageNum - 1) * limitNum, limit: limitNum }
      )
        .sort({ score: { $meta: 'textScore' } })
        .lean();
    }

    /* ---------- 2) prefix fallback when needed ---------- */
    const needRegex =
      !q || q.trim().length < 3 || textHits.length < limitNum;

    if (needRegex && q && q.trim()) {
      const rx = new RegExp(q.trim(), 'i');
      regexHits = await Item.find(
        {
          ...locFilter,
          $or: [
            { title: rx },
            { description: rx },
            { tags: rx },
          ],
        },
        null,
        { limit: limitNum }
      ).lean();
    }

    /* ---------- merge & dedupe ---------- */
    const combined = [];
    const seen = new Set();

    [...textHits, ...regexHits].forEach((doc) => {
      if (!seen.has(doc._id.toString()) && combined.length < limitNum) {
        combined.push(doc);
        seen.add(doc._id.toString());
      }
    });

    const total = combined.length;
    const queryTime = Date.now() - start;

    // fix URLs
    const fixedItems = combined.map(fixItemImageUrl);

    res.json({
      data: fixedItems,
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        queryTime,
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
    let tags = [];

    // ────────────────────────────────────────────────────────────
    // 1. Handle image upload + auto-tagging
    // ────────────────────────────────────────────────────────────
    if (req.file) {
      try {
        const { url } = await uploadToS3(req.file);
        imageUrl = url;
        tags = await detectTags(req.file.buffer);      // Rekognition labels
      } catch (err) {
        console.error('Failed to upload to S3 or detect tags', err);
        return res.status(500).json({ message: 'Image upload or tagging failed' });
      }
    }

    // ────────────────────────────────────────────────────────────
    // 2. Resolve owner email from JWT (or fallback)
    // ────────────────────────────────────────────────────────────
    let ownerEmail = 'rackoon1030@gmail.com';          // final fallback
    if (req.auth?.payload?.sub) {
      ownerEmail =
        req.auth.payload['https://lostlink.app/email'] ||
        req.auth.payload.email ||
        ownerEmail;
    }

    // ────────────────────────────────────────────────────────────
    // 3. Create and save the Item document
    //    • createdBy = Mongo ObjectId from attachUser
    // ────────────────────────────────────────────────────────────
    const item = new Item({
      title,
      description,
      location,
      imageUrl,
      ownerEmail,
      tags,
      createdBy: req.userDoc?._id || null,
    });

    const savedItem = await item.save();

    // ────────────────────────────────────────────────────────────
    // 4. Respond
    // ────────────────────────────────────────────────────────────
    res.status(201).json({
      ...savedItem.toObject(),
      tagsSuggested: tags,
    });
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

    const fixedItem = fixItemImageUrl(item.toObject());
    res.json(fixedItem);
  } catch (err) {
    next(err);
  }
}
