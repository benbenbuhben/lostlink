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

// 검색 성능 최적화를 위한 인덱스
itemSchema.index({ createdAt: -1 }); // 최신 순 정렬용
itemSchema.index({ location: 1 }); // 위치 필터용
itemSchema.index({ title: 'text', description: 'text' }); // 텍스트 검색용
itemSchema.index({ location: 1, createdAt: -1 }); // 복합 인덱스 (위치 + 날짜)

const Item = mongoose.model('Item', itemSchema);

export default Item; 