import { PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import getS3Client from '../config/minioClient.js';

export default async function uploadToS3(file) {
  // file: { buffer, originalname, mimetype }
  const bucket = process.env.MINIO_BUCKET_NAME;
  if (!bucket) {
    throw new Error('MINIO_BUCKET_NAME not set');
  }

  // Get S3 client (lazy initialization)
  const s3Client = getS3Client();

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
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err.Code === 'NotFound' || err.Code === 'NoSuchBucket') {
      if (isMinIO) {
        // MinIO: auto-create bucket
        console.log(`Bucket ${bucket} does not exist – creating...`);
        await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
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
    await s3Client.send(
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

  await s3Client.send(cmd);
  console.log(`File uploaded to ${bucket}/${key}`);

  // Generate public URL based on storage type
  let publicUrl;
  if (isMinIO) {
    // MinIO: use MINIO_PUBLIC_URL or MINIO_ENDPOINT
    const baseUrl = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT;
    publicUrl = `${baseUrl.replace(/\/$/, '')}/${bucket}/${key}`;
  } else {
    // AWS S3: use standard S3 URL format
    const region = process.env.MINIO_REGION || 'us-east-1';
    const baseUrl = process.env.MINIO_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`;
    publicUrl = `${baseUrl.replace(/\/$/, '')}/${key}`;
  }

  return { key, url: publicUrl };
} 