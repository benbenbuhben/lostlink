# 🚀 LostLink 3중 배포 로드맵

Frontend + Backend + Database 완전 배포 가이드

---

## 📍 현재 상태

- ✅ **Frontend**: Vercel 배포 완료
- ⏳ **Backend**: EC2 배포 필요
- ⏳ **Database**: MongoDB Atlas 설정 필요

---

## 🎯 배포 순서

### 1단계: MongoDB Atlas 설정 (5분) ⚡

**파일**: `ATLAS_QUICK_SETUP.md`

1. MongoDB Atlas 계정 생성
2. Free 클러스터 생성
3. Database User 생성
4. Network Access 설정
5. Connection String 복사

**예상 시간**: 5분

---

### 2단계: EC2 Backend 배포 (1-1.5시간)

**파일**: `EC2_DEPLOYMENT.md`

1. EC2 인스턴스 생성
2. SSH 접속
3. Node.js + PM2 설치
4. 코드 배포
5. 환경 변수 설정 (Atlas Connection String 포함)
6. Nginx 설정
7. 보안 그룹 설정

**예상 시간**: 1-1.5시간

---

### 3단계: 환경 변수 연결 (10분)

**Frontend (Vercel)**:
```
EXPO_PUBLIC_API_URL=http://YOUR-EC2-IP
EXPO_PUBLIC_AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc
EXPO_PUBLIC_AUTH0_REDIRECT_URI=https://lostlink.vercel.app
EXPO_PUBLIC_AUTH0_AUDIENCE=https://lostlink-api
```

**Backend (EC2)**:
```
MONGO_URI=mongodb+srv://... (Atlas에서 복사)
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=your-aws-s3-key
MINIO_SECRET_KEY=your-aws-s3-secret
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_REGION=us-west-2
MINIO_PUBLIC_URL=https://lostlink-uploads.s3.us-west-2.amazonaws.com
AWS_ACCESS_KEY_ID=your-rekognition-key
AWS_SECRET_ACCESS_KEY=your-rekognition-secret
AWS_REGION=us-west-2
AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
AUTH0_AUDIENCE=https://lostlink-api
RESEND_API_KEY=your-resend-key (선택사항)
FROM_EMAIL=lostlink@thomasha.dev (선택사항)
```

**예상 시간**: 10분

---

### 4단계: 통합 테스트 (20분)

1. Frontend 접속 확인
2. Backend API 테스트
3. 로그인 테스트
4. 이미지 업로드 테스트
5. 자동 태깅 확인
6. 검색 기능 테스트

**예상 시간**: 20분

---

## ⏱️ 총 예상 시간

- MongoDB Atlas: 5분
- EC2 Backend: 1-1.5시간
- 환경 변수: 10분
- 테스트: 20분
- **총**: 약 2시간

---

## ✅ 체크리스트

### MongoDB Atlas
- [ ] 계정 생성
- [ ] Free 클러스터 생성
- [ ] Database User 생성
- [ ] Network Access 설정
- [ ] Connection String 복사

### EC2 Backend
- [ ] 인스턴스 생성
- [ ] SSH 접속
- [ ] Node.js 설치
- [ ] PM2 설치
- [ ] 코드 배포
- [ ] 환경 변수 설정
- [ ] PM2로 실행
- [ ] Nginx 설정
- [ ] 보안 그룹 설정

### 환경 변수
- [ ] Frontend 환경 변수 설정
- [ ] Backend 환경 변수 설정
- [ ] 재배포

### 테스트
- [ ] Frontend 접속
- [ ] Backend API 응답
- [ ] 로그인
- [ ] 이미지 업로드
- [ ] 자동 태깅
- [ ] 검색

---

## 🚀 시작하기

1. **먼저**: `ATLAS_QUICK_SETUP.md` 따라하기 (5분)
2. **그 다음**: `EC2_DEPLOYMENT.md` 따라하기 (1-1.5시간)
3. **마지막**: 환경 변수 설정 및 테스트

---

## 💰 비용

- **MongoDB Atlas**: 무료 (512MB)
- **EC2**: 무료 (12개월) → $7-10/월
- **AWS S3**: 무료 (5GB)
- **Vercel**: 무료
- **총**: $0 (12개월) → $7-10/월

---

화이팅! 🎉

