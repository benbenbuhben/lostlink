# 🚀 LostLink 완전 배포 가이드

로컬 개발 환경에서 프로덕션 배포까지의 전체 과정을 시간 순서대로 정리한 가이드입니다.

---

## 📋 배포 아키텍처

- **Frontend**: Vercel (React Native Web)
- **Backend**: AWS EC2 (Node.js + Express)
- **Database**: MongoDB Atlas (Cloud)
- **Image Storage**: AWS S3
- **Image Tagging**: AWS Rekognition
- **Email**: Resend
- **Auth**: Auth0

---

## 🗺️ 배포 타임라인

### Phase 1: 로컬 개발 환경 설정

#### 1.1 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/benbenbuhben/lostlink.git
cd lostlink

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

#### 1.2 Docker Compose로 로컬 환경 실행

```bash
# 루트 디렉토리에서
docker compose up -d
```

**서비스:**
- Backend: `http://localhost:5001`
- MongoDB: `localhost:27017`
- MinIO: `http://localhost:9000` (로컬 이미지 저장소)

#### 1.3 환경변수 설정 (로컬)

**루트 `.env` 파일:**
```bash
MONGO_URI=mongodb://mongo:27017/lostlink
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_PUBLIC_URL=http://YOUR-LAN-IP:9000  # 로컬 네트워크 IP
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-west-2
AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
AUTH0_AUDIENCE=https://lostlink-api
RESEND_API_KEY=your-resend-key
FROM_EMAIL=your-email@domain.com
```

---

### Phase 2: AWS 서비스 설정

#### 2.1 AWS S3 버킷 생성

1. AWS Console → S3 → **Create bucket**
2. 버킷 이름: `lostlink-uploads` (고유해야 함)
3. 리전: `us-east-1` (또는 원하는 리전)
4. **Block Public Access** → **Uncheck** (이미지 공개 필요)
5. 버킷 정책 설정:
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
6. CORS 설정:
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

#### 2.2 AWS IAM 사용자 생성 (S3 + Rekognition)

1. AWS Console → IAM → **Users** → **Create user**
2. 사용자 이름: `lostlink-s3-rekognition`
3. **Attach policies directly**:
   - `AmazonS3FullAccess` (또는 버킷별 제한 정책)
   - `AmazonRekognitionFullAccess`
4. **Create user**
5. **Security credentials** 탭 → **Create access key**
6. Access Key ID와 Secret Access Key 복사 (`.env`에 저장)

#### 2.3 코드 수정: MinIO → AWS S3 전환

**변경 사항:**
- `backend/src/config/minioClient.js`: MinIO/S3 자동 감지 로직 추가
- `backend/src/utils/uploadToS3.js`: S3 업로드 로직 개선
- `docker-compose.yml`: 환경변수로 MinIO/S3 전환 가능

**로컬에서 S3 사용하려면:**
```bash
# .env에서
MINIO_ENDPOINT=  # 비워두기
MINIO_ACCESS_KEY=your-aws-access-key
MINIO_SECRET_KEY=your-aws-secret-key
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_REGION=us-east-1
MINIO_PUBLIC_URL=https://lostlink-uploads.s3.us-east-1.amazonaws.com
```

---

### Phase 3: 이메일 서비스 전환 (SendGrid → Resend)

#### 3.1 Resend 계정 생성

1. [Resend](https://resend.com) 접속 → Sign Up
2. API Key 생성 → 복사

#### 3.2 도메인 인증 (선택사항)

**옵션 1: Resend 기본 도메인 사용 (빠른 테스트)**
```bash
FROM_EMAIL=onboarding@resend.dev
```

**옵션 2: 커스텀 도메인 사용 (프로덕션)**
1. Resend Dashboard → Domains → Add Domain
2. DNS 레코드 추가 (SPF, DKIM, DMARC)
3. 인증 완료 후:
```bash
FROM_EMAIL=lostlink@yourdomain.com
```

#### 3.3 코드 수정

- `backend/src/config/sendgrid.js` 삭제
- `backend/src/config/resend.js` 생성
- `backend/src/controllers/claimController.js`: Resend import로 변경

---

### Phase 4: MongoDB Atlas 설정

#### 4.1 클러스터 생성

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 접속
2. **Build a Database** → **FREE (M0)** 선택
3. 리전 선택 (예: `us-west-2`)
4. 클러스터 이름: `lostlink-cluster`

#### 4.2 Database User 생성

1. **Database Access** → **Add New Database User**
2. Username: `lostlink-user`
3. Password: 강력한 비밀번호 생성
4. Privileges: **Atlas admin**

#### 4.3 Network Access 설정

1. **Network Access** → **Add IP Address**
2. **Allow Access from Anywhere** (`0.0.0.0/0`) 선택 (또는 EC2 IP만)
3. **Confirm**

#### 4.4 Connection String 복사

1. **Connect** → **Connect your application**
2. Connection String 복사:
```
mongodb+srv://lostlink-user:PASSWORD@lostlink-cluster.xxxxx.mongodb.net/lostlink?retryWrites=true&w=majority
```

---

### Phase 5: 프론트엔드 배포 (Vercel)

#### 5.1 Vercel CLI 설치 및 로그인

```bash
npm i -g vercel
vercel login
```

#### 5.2 빌드 설정

**`frontend/vercel.json` 생성:**
```json
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "web-build",
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 5.3 배포

```bash
cd frontend
vercel --prod
```

#### 5.4 환경변수 설정

Vercel Dashboard → Settings → Environment Variables:
```
EXPO_PUBLIC_API_URL=https://api.thomasha.dev
EXPO_PUBLIC_AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc
EXPO_PUBLIC_AUTH0_AUDIENCE=https://lostlink-api
```

**재배포:**
```bash
vercel --prod
```

#### 5.5 Auth0 콜백 URL 설정

1. Auth0 Dashboard → Applications → LostLink
2. **Allowed Callback URLs**:
   ```
   https://*.vercel.app,
   https://*.vercel.app/*
   ```
3. **Allowed Logout URLs**: `https://*.vercel.app`
4. **Allowed Web Origins**: `https://*.vercel.app`

---

### Phase 6: 백엔드 배포 (EC2)

#### 6.1 EC2 인스턴스 생성

1. AWS Console → EC2 → **Launch Instance**
2. **Name**: `lostlink-backend`
3. **AMI**: Amazon Linux 2023
4. **Instance type**: `t2.micro` (무료 티어)
5. **Key pair**: 새로 생성 (`lostlink-backend-key.pem`)
6. **Network settings**:
   - Allow HTTP/HTTPS traffic 체크
   - SSH는 My IP만 허용
7. **Storage**: 20-30GB
8. **Launch Instance**

#### 6.2 SSH 접속

```bash
chmod 400 ~/Downloads/lostlink-backend-key.pem
ssh -i ~/Downloads/lostlink-backend-key.pem ec2-user@YOUR-EC2-IP
```

#### 6.3 Node.js 및 PM2 설치

```bash
# Node.js 20 설치
sudo dnf install -y nodejs npm
# 또는 nvm 사용
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# PM2 설치
npm install -g pm2
```

#### 6.4 코드 배포

```bash
cd ~
git clone https://github.com/benbenbuhben/lostlink.git
cd lostlink/backend
npm install --production
```

#### 6.5 환경변수 설정

```bash
nano ~/lostlink/backend/.env
```

**내용:**
```bash
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://lostlink-user:PASSWORD@lostlink-cluster.xxxxx.mongodb.net/lostlink?retryWrites=true&w=majority

# AWS S3
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=AKIA...
MINIO_SECRET_KEY=...
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_REGION=us-east-1
MINIO_PUBLIC_URL=https://lostlink-uploads.s3.us-east-1.amazonaws.com

# AWS Rekognition
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-west-2

# Auth0
AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
AUTH0_AUDIENCE=https://lostlink-api

# Resend
RESEND_API_KEY=re_...
FROM_EMAIL=lostlink@yourdomain.com
```

#### 6.6 PM2로 실행

```bash
cd ~/lostlink/backend
pm2 start index.js --name lostlink-backend
pm2 save
pm2 startup
# 출력된 명령어 복사해서 실행
```

#### 6.7 Nginx 설정

```bash
# Nginx 설치
sudo dnf install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/conf.d/lostlink.conf
```

**내용:**
```nginx
server {
    listen 80;
    server_name api.thomasha.dev;  # 또는 EC2 IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 6.8 SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo dnf install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d api.thomasha.dev

# 자동 갱신 설정
sudo certbot renew --dry-run
```

#### 6.9 보안 그룹 설정

AWS Console → EC2 → Security Groups:
- **Inbound rules**:
  - HTTP (80) from `0.0.0.0/0`
  - HTTPS (443) from `0.0.0.0/0`
  - SSH (22) from `My IP`

---

### Phase 7: DNS 설정 (커스텀 도메인)

#### 7.1 도메인 등록

예: `thomasha.dev` (이미 소유)

#### 7.2 DNS 레코드 추가

**A Record:**
```
Type: A
Name: api
Value: EC2_PUBLIC_IP
TTL: 3600
```

**또는 CNAME (Elastic IP 사용 시):**
```
Type: CNAME
Name: api
Value: ec2-xxx-xxx-xxx-xxx.compute-1.amazonaws.com
```

#### 7.3 DNS 전파 대기

5-30분 소요

---

### Phase 8: 통합 테스트

#### 8.1 프론트엔드 접속

- URL: `https://lostlink-*.vercel.app`
- 브라우저 콘솔에서 API URL 확인: `🌐 API URL configured: https://api.thomasha.dev`

#### 8.2 백엔드 API 테스트

```bash
curl https://api.thomasha.dev/test
curl https://api.thomasha.dev/env-check
```

#### 8.3 기능 테스트

1. ✅ 로그인 (Auth0)
2. ✅ 아이템 목록 조회
3. ✅ 아이템 등록 (이미지 업로드)
4. ✅ 이미지 자동 태깅 확인
5. ✅ 검색 기능
6. ✅ 클레임 기능
7. ✅ 이메일 알림

---

## 🔧 주요 문제 해결

### 문제 1: 프론트엔드가 로컬 IP 사용

**해결:** `frontend/hooks/useApi.ts`에서 런타임에 프로덕션 환경 감지:
```typescript
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://api.thomasha.dev';
  }
  return 'http://192.168.254.29:5001'; // 로컬 개발
};
```

### 문제 2: CORS 에러

**해결:** `backend/src/app.js`에서 Vercel 도메인 자동 허용:
```javascript
if (origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
  return callback(null, true);
}
```

### 문제 3: AWS S3 Credentials 에러

**해결:** `backend/src/config/minioClient.js`에서 lazy initialization:
- 앱 시작 시 credentials 없어도 OK
- 실제 업로드 시점에만 체크

### 문제 4: JWT 토큰 에러 로그

**해결:** `backend/src/middleware/auth.js`에서 로그 제거 (정상 동작)

---

## 📝 환경변수 체크리스트

### 프론트엔드 (Vercel)
- [x] `EXPO_PUBLIC_API_URL`
- [x] `EXPO_PUBLIC_AUTH0_DOMAIN`
- [x] `EXPO_PUBLIC_AUTH0_CLIENT_ID`
- [x] `EXPO_PUBLIC_AUTH0_AUDIENCE`

### 백엔드 (EC2)
- [x] `MONGO_URI`
- [x] `MINIO_ACCESS_KEY`
- [x] `MINIO_SECRET_KEY`
- [x] `MINIO_BUCKET_NAME`
- [x] `MINIO_REGION`
- [x] `MINIO_PUBLIC_URL`
- [x] `AWS_ACCESS_KEY_ID`
- [x] `AWS_SECRET_ACCESS_KEY`
- [x] `AWS_REGION`
- [x] `AUTH0_DOMAIN`
- [x] `AUTH0_AUDIENCE`
- [x] `RESEND_API_KEY`
- [x] `FROM_EMAIL`

---

## 🎉 배포 완료!

모든 서비스가 정상 작동 중입니다:
- ✅ 프론트엔드: Vercel
- ✅ 백엔드: EC2 + Nginx + SSL
- ✅ 데이터베이스: MongoDB Atlas
- ✅ 이미지: AWS S3
- ✅ 태깅: AWS Rekognition
- ✅ 이메일: Resend
- ✅ 인증: Auth0

---

## 📚 참고 문서

- 상세 가이드: [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md)
- MongoDB: [ATLAS_QUICK_SETUP.md](./ATLAS_QUICK_SETUP.md)
- Vercel: [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md)

