import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

// POST /items/:id/claim
export async function createClaim(req, res, next) {
  try {
    const { message } = req.body;

    const claim = new Claim({
      itemId: req.params.id,
      claimerId: req.auth?.sub || 'anonymous', // 임시로 anonymous 사용자 허용
      message,
    });

    const savedClaim = await claim.save();
    
    // 아이템에 클레임 추가
    await Item.findByIdAndUpdate(
      req.params.id,
      { $push: { claims: savedClaim._id } }
    );
    
    res.status(201).json(savedClaim);
  } catch (err) {
    next(err);
  }
} 