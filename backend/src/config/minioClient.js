import { S3Client } from '@aws-sdk/client-s3';

// Detect if we're using MinIO (local) or AWS S3 (production)
const isMinIO = process.env.MINIO_ENDPOINT && 
                (process.env.MINIO_ENDPOINT.includes('minio') || 
                 process.env.MINIO_ENDPOINT.includes('localhost') ||
                 process.env.MINIO_ENDPOINT.includes('192.168') ||
                 process.env.MINIO_ENDPOINT.includes('127.0.0.1'));

// AWS S3 credentials 확인 (없어도 앱은 시작되도록)
// trim()으로 앞뒤 공백 제거
const accessKeyId = process.env.MINIO_ACCESS_KEY?.trim();
const secretAccessKey = process.env.MINIO_SECRET_KEY?.trim();

let s3Client = null;

// Credentials가 있으면 S3Client 생성, 없으면 null (나중에 업로드 시 에러 발생)
if (accessKeyId && secretAccessKey) {
  // 디버깅: credentials 길이 확인 (실제 값은 로그하지 않음)
  console.log('🔑 AWS S3 credentials found');
  console.log('   Access Key length:', accessKeyId.length);
  console.log('   Secret Key length:', secretAccessKey.length);
  console.log('   Region:', process.env.MINIO_REGION || 'us-east-1');
  
  const s3Config = {
    region: process.env.MINIO_REGION?.trim() || 'us-east-1',
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
} else {
  console.warn('⚠️ AWS S3 credentials not configured - image upload will fail');
  console.warn('   MINIO_ACCESS_KEY:', accessKeyId ? '***set***' : 'NOT SET');
  console.warn('   MINIO_SECRET_KEY:', secretAccessKey ? '***set***' : 'NOT SET');
}

export default s3Client; 