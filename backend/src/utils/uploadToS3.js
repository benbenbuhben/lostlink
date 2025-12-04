import { PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client from '../config/minioClient.js';

// 실제 사용 시점에 S3Client 생성 (환경변수가 확실히 로드된 후)
function getS3Client() {
  // 이미 생성된 클라이언트가 있으면 사용
  if (s3Client) {
    return s3Client;
  }

  // 없으면 동적으로 생성
  const accessKeyId = process.env.MINIO_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.MINIO_SECRET_KEY?.trim();
  const region = process.env.MINIO_REGION?.trim() || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 credentials (MINIO_ACCESS_KEY, MINIO_SECRET_KEY) must be set');
  }

  console.log('🔑 Creating S3Client dynamically...');
  console.log('   Access Key:', accessKeyId.substring(0, 8) + '...');
  console.log('   Region:', region);

  return new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

export default async function uploadToS3(file) {
  // file: { buffer, originalname, mimetype }
  const bucket = process.env.MINIO_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error('MINIO_BUCKET_NAME not set');
  }

  // 실제 사용 시점에 S3Client 가져오기 (동적 생성)
  const client = getS3Client();

  const ext = file.originalname.split('.').pop();
  const key = `${uuidv4()}.${ext}`;

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };

  // Check if bucket exists (AWS S3 requires bucket to be pre-created)
  // MinIO can auto-create, but we'll check first
  const isMinIO = process.env.MINIO_ENDPOINT && 
                  (process.env.MINIO_ENDPOINT.includes('minio') || 
                   process.env.MINIO_ENDPOINT.includes('localhost') ||
                   process.env.MINIO_ENDPOINT.includes('192.168'));

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err.Code === 'NotFound' || err.Code === 'NoSuchBucket') {
      if (isMinIO) {
        // MinIO: auto-create bucket
        console.log(`Bucket ${bucket} does not exist – creating...`);
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
      } else {
        // AWS S3: bucket must be pre-created
        throw new Error(`Bucket ${bucket} does not exist. Please create it in AWS S3 Console first.`);
      }
    } else {
      throw err;
    }
  }

  // Apply (or re-apply) public-read policy
  try {
    await client.send(
      new PutBucketPolicyCommand({ Bucket: bucket, Policy: JSON.stringify(policy) }),
    );
  } catch (policyErr) {
    console.warn(`Could not set bucket policy (may already exist):`, policyErr?.Code || policyErr);
  }

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await client.send(cmd);
  console.log(`File uploaded to ${bucket}/${key}`);

  // Generate public URL based on storage type
  let publicUrl;
  if (isMinIO) {
    // MinIO: use MINIO_PUBLIC_URL or MINIO_ENDPOINT
    const baseUrl = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT;
    publicUrl = `${baseUrl.replace(/\/$/, '')}/${bucket}/${key}`;
  } else {
    // AWS S3: use standard S3 URL format
    const region = process.env.MINIO_REGION?.trim() || 'us-east-1';
    const baseUrl = process.env.MINIO_PUBLIC_URL?.trim() || `https://${bucket}.s3.${region}.amazonaws.com`;
    publicUrl = `${baseUrl.replace(/\/$/, '')}/${key}`;
  }

  return { key, url: publicUrl };
} 