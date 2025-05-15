import { PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client from '../config/minioClient.js';

export default async function uploadToS3(file) {
  // file: { buffer, originalname, mimetype }
  const bucket = process.env.MINIO_BUCKET_NAME;
  if (!bucket) {
    throw new Error('MINIO_BUCKET_NAME not set');
  }

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

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err.Code === 'NotFound' || err.Code === 'NoSuchBucket') {
      console.log(`Bucket ${bucket} does not exist – creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
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

  const baseUrl = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT;
  const publicUrl = `${baseUrl.replace(/\/$/, '')}/${bucket}/${key}`;
  return { key, url: publicUrl };
} 