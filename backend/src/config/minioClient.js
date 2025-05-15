import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.MINIO_REGION || 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT, // e.g. http://minio:9000
  forcePathStyle: true, // needed for MinIO / localstack
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
});

export default s3Client; 