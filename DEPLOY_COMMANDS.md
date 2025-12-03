# 배포 명령어 모음

## Frontend 배포 (Vercel)

### 1. 기존 프로젝트 삭제 (선택사항)
```bash
cd frontend
vercel remove lostlink-frontend --yes
```

### 2. 새로 배포
```bash
cd frontend
vercel --prod
```

**프롬프트 답변:**
- Set up and deploy? → `yes`
- Which scope? → 선택
- Link to existing project? → `no`
- What's your project's name? → `lostlink` (소문자, 하이픈만 사용)
- In which directory is your code located? → `./`
- Want to modify these settings? → `no`
- Do you want to change additional project settings? → `no`

### 3. 배포 완료 후 URL 확인
배포가 완료되면 URL이 표시됩니다:
```
Production: https://lostlink.vercel.app
```

---

## Backend 배포 (Railway 추천)

### Railway CLI 설치 (선택사항)
```bash
npm i -g @railway/cli
railway login
```

### Railway 배포
```bash
cd backend
railway init
railway up
```

또는 Railway Dashboard에서:
1. https://railway.app 접속
2. New Project → Deploy from GitHub repo
3. 저장소 선택
4. Root Directory: `backend` 설정
5. 환경 변수 추가

---

## MongoDB Atlas 설정

### 1. 클러스터 생성
1. https://cloud.mongodb.com 접속
2. Create → Build a Database
3. Free (M0) 선택
4. Cloud Provider & Region 선택
5. Cluster Name: `lostlink-cluster`
6. Create

### 2. Database Access 설정
1. Database Access → Add New Database User
2. Username/Password 생성
3. Database User Privileges: `Atlas admin` 또는 `Read and write to any database`

### 3. Network Access 설정
1. Network Access → Add IP Address
2. `0.0.0.0/0` 추가 (모든 IP 허용) 또는 특정 IP

### 4. Connection String 생성
1. Database → Connect
2. Connect your application 선택
3. Connection String 복사:
   ```
   mongodb+srv://<username>:<password>@lostlink-cluster.xxxxx.mongodb.net/lostlink?retryWrites=true&w=majority
   ```
4. `<username>`과 `<password>`를 실제 값으로 교체

---

## 환경 변수 설정

### Frontend (Vercel Dashboard)
Vercel Dashboard → Project → Settings → Environment Variables:

```
EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app
EXPO_PUBLIC_AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc
EXPO_PUBLIC_AUTH0_REDIRECT_URI=https://lostlink.vercel.app
EXPO_PUBLIC_AUTH0_AUDIENCE=https://lostlink-api
```

### Backend (Railway/Render/Heroku)
Railway Dashboard → Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lostlink
AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
AUTH0_AUDIENCE=https://lostlink-api
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=your-aws-s3-access-key
MINIO_SECRET_KEY=your-aws-s3-secret-key
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_REGION=us-west-2
MINIO_PUBLIC_URL=https://lostlink-uploads.s3.us-west-2.amazonaws.com
AWS_ACCESS_KEY_ID=your-rekognition-key
AWS_SECRET_ACCESS_KEY=your-rekognition-secret
AWS_REGION=us-west-2
RESEND_API_KEY=your-resend-key
FROM_EMAIL=lostlink@thomasha.dev
```

---

## 빠른 체크리스트

- [ ] Frontend 배포 완료 → URL 확인
- [ ] Backend 배포 완료 → URL 확인
- [ ] MongoDB Atlas 클러스터 생성
- [ ] Frontend 환경 변수 설정
- [ ] Backend 환경 변수 설정
- [ ] Auth0 Callback URL 업데이트
- [ ] 전체 플로우 테스트

