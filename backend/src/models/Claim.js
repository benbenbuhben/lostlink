import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimerId: { type: String },
    claimerEmail: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Claim = mongoose.model('Claim', claimSchema);

export default Claim; 