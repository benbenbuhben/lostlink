import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    imageUrl: { type: String },
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

const Item = mongoose.model('Item', itemSchema);

export default Item; 