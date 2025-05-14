import Claim from '../models/Claim.js';

// POST /items/:id/claim
export async function createClaim(req, res, next) {
  try {
    const { message } = req.body;

    const claim = new Claim({
      itemId: req.params.id,
      claimerId: req.user?.id, // TODO: add after auth middleware
      message,
    });

    const savedClaim = await claim.save();
    res.status(201).json(savedClaim);
  } catch (err) {
    next(err);
  }
} 