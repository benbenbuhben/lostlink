import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

const router = express.Router();

// POST /claims - 클레임 제출
router.post('/', authenticate, async (req, res) => {
  try {
    const { itemId, message } = req.body;

    // 입력 유효성 검사
    if (!itemId || !message) {
      return res.status(400).json({
        error: 'itemId and message are required'
      });
    }

    // 아이템 존재 확인
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // 새 클레임 생성 (기존 스키마 사용)
    const newClaim = new Claim({
      itemId,
      claimerId: req.auth?.sub || 'anonymous',
      message: message.trim()
    });

    await newClaim.save();

    // 응답에 아이템 정보 포함
    const claimWithItem = await Claim.findById(newClaim._id).populate('itemId', 'title location');

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: claimWithItem
    });

  } catch (error) {
    console.error('Error submitting claim:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /claims - 클레임 목록 조회
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      itemId
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // 필터 조건 구성
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }
    if (itemId) {
      filter.itemId = itemId;
    }

    // 병렬로 데이터와 총 개수 조회
    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('itemId', 'title location imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Claim.countDocuments(filter)
    ]);

    res.json({
      data: claims,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /claims/:id - 특정 클레임 조회
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid claim ID' });
    }

    const claim = await Claim.findById(id).populate('itemId');
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json({ data: claim });

  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /claims/:id/status - 클레임 상태 업데이트 (관리자용)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid claim ID' });
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses: ['approved', 'rejected']
      });
    }

    const updatedClaim = await Claim.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('itemId', 'title location');

    if (!updatedClaim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json({
      message: 'Claim status updated successfully',
      claim: updatedClaim
    });

  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /claims/stats - 클레임 통계 (관리자용)
router.get('/admin/stats', authenticate, async (req, res) => {
  try {
    const stats = await Claim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalClaims = await Claim.countDocuments();
    const recentClaims = await Claim.countDocuments({
      submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      total: totalClaims,
      recentWeek: recentClaims,
      byStatus: {
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        resolved: statusCounts.resolved || 0
      }
    });

  } catch (error) {
    console.error('Error fetching claim stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 