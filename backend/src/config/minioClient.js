import { S3Client } from '@aws-sdk/client-s3';

// Detect if we're using MinIO (local) or AWS S3 (production)
const isMinIO = process.env.MINIO_ENDPOINT && 
                (process.env.MINIO_ENDPOINT.includes('minio') || 
                 process.env.MINIO_ENDPOINT.includes('localhost') ||
                 process.env.MINIO_ENDPOINT.includes('192.168') ||
                 process.env.MINIO_ENDPOINT.includes('127.0.0.1'));

const s3Config = {
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
};

// MinIO requires endpoint and forcePathStyle
// AWS S3 doesn't need endpoint (uses default AWS endpoints)
if (isMinIO) {
  s3Config.endpoint = process.env.MINIO_ENDPOINT;
  s3Config.forcePathStyle = true;
  console.log('📦 Using MinIO (local development)');
} else {
  console.log('☁️ Using AWS S3 (production)');
}

const s3Client = new S3Client(s3Config);

export default s3Client; 