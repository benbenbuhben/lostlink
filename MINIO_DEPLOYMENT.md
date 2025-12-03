# MinIO 배포 환경 설정 가이드

## 개요

MinIO는 배포 환경에서도 사용 가능하지만, 별도의 서비스로 실행해야 합니다.

---

## 옵션 1: Railway에서 MinIO 사용 (추천)

### Step 1: Railway에 MinIO 서비스 추가

1. Railway Dashboard → New Project
2. **Add Service** → **New Database** → **MinIO** 선택
   - 또는 **Empty Service** → Docker Image: `minio/minio`
3. MinIO 서비스 설정:
   - **Command**: `server /data --console-address ":9001"`
   - **Port**: `9000` (S3 API)
   - **Environment Variables**:
     ```
     MINIO_ROOT_USER=your-secure-username
     MINIO_ROOT_PASSWORD=your-secure-password
     ```

### Step 2: Backend 서비스 설정

1. Backend 서비스의 **Environment Variables**에 추가:
   ```
   MINIO_ENDPOINT=https://your-minio-service.railway.app
   MINIO_ACCESS_KEY=your-secure-username
   MINIO_SECRET_KEY=your-secure-password
   MINIO_BUCKET_NAME=lostlink-uploads
   MINIO_PUBLIC_URL=https://your-minio-service.railway.app
   ```

2. **중요**: Railway는 자동으로 HTTPS URL을 제공합니다.
   - MinIO 서비스의 **Public Domain**을 확인
   - `MINIO_PUBLIC_URL`에 이 URL 사용

### Step 3: CORS 설정

MinIO Console (포트 9001)에서:
1. Bucket → `lostlink-uploads` 선택
2. **Access Policy** → **Public** 또는 **Custom**
3. **CORS Rules** 추가:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

---

## 옵션 2: AWS S3로 전환 (더 간단하고 안정적)

### 장점
- ✅ 별도 서비스 관리 불필요
- ✅ 자동 백업 및 확장성
- ✅ 더 나은 성능
- ✅ 무료 티어: 5GB 스토리지, 20,000 GET 요청/월

### Step 1: AWS S3 버킷 생성

1. AWS Console → S3 → **Create bucket**
2. 버킷 이름: `lostlink-uploads` (고유해야 함)
3. **Block Public Access** → **Uncheck** (이미지 공개 필요)
4. **Bucket Policy** 추가:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::lostlink-uploads/*"
       }
     ]
   }
   ```
5. **CORS Configuration**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

### Step 2: IAM 사용자 생성 (S3 접근용)

1. AWS Console → IAM → **Users** → **Create user**
2. 사용자 이름: `lostlink-s3-user`
3. **Attach policies directly** → `AmazonS3FullAccess` (또는 더 제한적인 정책)
4. **Access keys** 생성 → **Application running outside AWS**
5. **Access Key ID**와 **Secret Access Key** 저장

### Step 3: Backend 환경 변수 업데이트

Railway/Render/Heroku에서:
```
# AWS S3 설정 (MinIO 대신)
MINIO_ENDPOINT=https://s3.us-west-2.amazonaws.com  # 또는 s3.amazonaws.com
MINIO_ACCESS_KEY=your-aws-access-key-id
MINIO_SECRET_KEY=your-aws-secret-access-key
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_PUBLIC_URL=https://lostlink-uploads.s3.us-west-2.amazonaws.com
MINIO_REGION=us-west-2  # 버킷 리전
```

**중요**: `forcePathStyle: true`는 MinIO용이므로, AWS S3를 사용할 때는 제거하거나 `false`로 설정해야 할 수 있습니다.

---

## 옵션 3: Render에서 MinIO 사용

1. Render Dashboard → **New** → **Web Service**
2. **Docker** 선택
3. **Docker Image**: `minio/minio:latest`
4. **Command**: `server /data --console-address ":9001"`
5. **Environment Variables**:
   ```
   MINIO_ROOT_USER=your-username
   MINIO_ROOT_PASSWORD=your-password
   ```
6. **Public URL** 확인 후 Backend 환경 변수에 설정

---

## 코드 수정 필요사항 (AWS S3 사용 시)

현재 코드는 `forcePathStyle: true`로 설정되어 있어 MinIO에 최적화되어 있습니다. AWS S3를 사용할 경우:

### `backend/src/config/minioClient.js` 수정:

```javascript
import { S3Client } from '@aws-sdk/client-s3';

const isMinIO = process.env.MINIO_ENDPOINT?.includes('minio') || 
                process.env.MINIO_ENDPOINT?.includes('localhost') ||
                process.env.MINIO_ENDPOINT?.includes('192.168');

const s3Client = new S3Client({
  region: process.env.MINIO_REGION || 'us-east-1',
  endpoint: isMinIO ? process.env.MINIO_ENDPOINT : undefined, // AWS S3는 endpoint 불필요
  forcePathStyle: isMinIO, // MinIO만 true, AWS S3는 false
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
});

export default s3Client;
```

---

## 추천

**포트폴리오 프로젝트**라면:
- **AWS S3 사용 추천** (옵션 2)
  - 설정이 더 간단
  - 무료 티어로 충분
  - 프로덕션 환경에 가까움
  - 이력서에 "AWS S3" 언급 가능

**로컬 개발과 동일한 환경**을 원한다면:
- **Railway MinIO** (옵션 1)
  - 로컬과 동일한 설정
  - 추가 서비스 관리 필요

---

## 비용 비교

| 옵션 | 비용 | 제한 |
|------|------|------|
| AWS S3 | 무료 티어: 5GB, 20K GET/월 | 이후 $0.023/GB |
| Railway MinIO | 무료 티어: $5 크레딧/월 | 제한적 |
| Render MinIO | 무료 티어: 제한적 | 750시간/월 |

포트폴리오 프로젝트라면 **AWS S3 무료 티어**로 충분합니다.

