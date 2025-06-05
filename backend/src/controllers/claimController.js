import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { sendClaimNotificationEmail } from '../config/sendgrid.js';

// POST /items/:id/claim
export async function createClaim(req, res, next) {
  try {
    const startTime = Date.now();
    const { message, email } = req.body;
    const itemId = req.params.id;

    // Input validation
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Claim message must be at least 10 characters long.' 
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'Email address is required.'
      });
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: 'Please provide a valid email address.'
      });
    }

    // Check if item exists and get owner information
    const item = await Item.findById(itemId).populate('createdBy');
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check for duplicate claims (prevent multiple claims from same email for same item)
    const existingClaim = await Claim.findOne({
      itemId: itemId,
      claimerEmail: email.trim().toLowerCase()
    });

    if (existingClaim) {
      return res.status(409).json({ 
        message: 'You have already submitted a claim for this item with this email address.',
        existingClaim: existingClaim
      });
    }

    // Create new claim
    const claim = new Claim({
      itemId: itemId,
      claimerId: req.auth?.sub || 'anonymous',
      claimerEmail: email.trim().toLowerCase(),
      message: message.trim(),
    });

    // Save claim
    const savedClaim = await claim.save();
    
    // Add claim to item
    await Item.findByIdAndUpdate(
      itemId,
      { $push: { claims: savedClaim._id } }
    );

    // Performance measurement
    const dbOperationTime = Date.now() - startTime;

    // Send email notification (async - doesn't affect response speed)
    let emailResult = null;
    const ownerEmail = item.ownerEmail || (item.createdBy && item.createdBy.email);
    
    if (ownerEmail) {
      // Send email in background
      setImmediate(async () => {
        try {
          emailResult = await sendClaimNotificationEmail(
            ownerEmail,  // Item owner email
            item,
            savedClaim,
            email.trim()  // Claimer email
          );
          
          console.log('📧 Email notification result:', emailResult);
          
          // Email delivery time logging (requirement 5.5)
          if (emailResult.success && emailResult.deliveryTime) {
            const isUnderOneMinute = emailResult.deliveryTime < 60000;
            console.log(`⏱️ Email delivery time: ${emailResult.deliveryTime}ms ${isUnderOneMinute ? '✅' : '⚠️ SLOW'}`);
          }
        } catch (emailError) {
          console.error('❌ Background email sending failed:', emailError);
        }
      });
    } else {
      console.log('📧 Skipping email - no item owner email found');
    }

    // Fast response (doesn't wait for email)
    const totalTime = Date.now() - startTime;
    
    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: {
        ...savedClaim.toObject(),
        // For security, partially hide claimer email
        claimerEmail: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      },
      performance: {
        dbOperationTime,
        totalResponseTime: totalTime,
        emailQueued: !!ownerEmail
      }
    });

  } catch (err) {
    console.error('❌ Error in createClaim:', err);
    next(err);
  }
}

// GET /claims/:id - Get claim details
export async function getClaimById(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId', 'title location description imageUrl')
      .lean();

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json(claim);
  } catch (err) {
    next(err);
  }
}

// PUT /claims/:id/status - Update claim status (for item owners)
export async function updateClaimStatus(req, res, next) {
  try {
    const { status } = req.body;
    const claimId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "approved" or "rejected"' 
      });
    }

    // Get claim and related item information
    const claim = await Claim.findById(claimId).populate('itemId');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Permission check (only item owner can change status)
    const userId = req.auth?.sub;
    if (claim.itemId.createdBy && claim.itemId.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Only the item owner can update claim status' 
      });
    }

    // Update status
    claim.status = status;
    const updatedClaim = await claim.save();

    // Send status update email to claimer (background)
    setImmediate(async () => {
      try {
        // Get claimer information (if Auth0 user)
        let claimerEmail = null;
        if (claim.claimerId !== 'anonymous') {
          // Logic to get user info via Auth0 API can be added here
          // Currently simplified/skipped
        }

        if (claimerEmail) {
          await sendClaimStatusUpdateEmail(claimerEmail, claim.itemId, claim, status);
        }
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
      }
    });

    res.json({
      message: `Claim ${status} successfully`,
      claim: updatedClaim
    });

  } catch (err) {
    next(err);
  }
} 