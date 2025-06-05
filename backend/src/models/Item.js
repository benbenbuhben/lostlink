import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    imageUrl: { type: String },
    ownerEmail: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    claims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Claim',
      },
    ],
  },
  { timestamps: true }
);

// Search performance optimization indexes
itemSchema.index({ createdAt: -1 });
itemSchema.index({ location: 1 });
itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ location: 1, createdAt: -1 });

const Item = mongoose.model('Item', itemSchema);

export default Item; 