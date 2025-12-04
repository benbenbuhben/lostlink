import { S3Client } from '@aws-sdk/client-s3';

// Lazy initialization: 실제 사용 시점에 S3Client 생성
let s3Client = null;

function getS3Client() {
  if (s3Client) {
    return s3Client;
  }

  // Detect if we're using MinIO (local) or AWS S3 (production)
  const isMinIO = process.env.MINIO_ENDPOINT && 
                  (process.env.MINIO_ENDPOINT.includes('minio') || 
                   process.env.MINIO_ENDPOINT.includes('localhost') ||
                   process.env.MINIO_ENDPOINT.includes('192.168') ||
                   process.env.MINIO_ENDPOINT.includes('127.0.0.1'));

  // AWS S3 credentials 확인
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ AWS S3 credentials not configured!');
    console.error('   MINIO_ACCESS_KEY:', accessKeyId ? '***set***' : 'NOT SET');
    console.error('   MINIO_SECRET_KEY:', secretAccessKey ? '***set***' : 'NOT SET');
    throw new Error('AWS S3 credentials (MINIO_ACCESS_KEY, MINIO_SECRET_KEY) must be set in environment variables');
  }

  const s3Config = {
    region: process.env.MINIO_REGION || 'us-east-1',
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
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

  s3Client = new S3Client(s3Config);
  return s3Client;
}

export default getS3Client; 