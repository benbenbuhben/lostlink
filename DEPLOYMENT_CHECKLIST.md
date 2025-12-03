# 배포 전 체크리스트 (Deployment Checklist)

## 🚨 MVP 핵심 기능 확인

### ✅ AWS Rekognition (이미지 자동 태깅) - **필수**

이미지 자동 태깅은 MVP의 핵심 기능입니다. 반드시 설정해야 합니다.

- [ ] AWS 계정 생성 완료
- [ ] Rekognition 서비스 활성화
- [ ] IAM 사용자 생성 (`lostlink-rekognition-user`)
- [ ] IAM 정책 연결: `AmazonRekognitionReadOnlyAccess`
- [ ] Access Key 생성 및 복사
- [ ] Backend 환경 변수 설정:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION` (예: `us-west-2`)
- [ ] 배포 후 로그 확인: `✅ AWS Rekognition client initialized`
- [ ] 테스트: 이미지 업로드 시 자동 태그 생성 확인

---

## Backend 배포

### 환경 변수 체크리스트

#### 필수 (Required)
- [ ] `MONGO_URI` - MongoDB Atlas 연결 문자열
- [ ] `AUTH0_DOMAIN` - Auth0 도메인
- [ ] `AUTH0_AUDIENCE` - Auth0 Audience
- [ ] `AWS_ACCESS_KEY_ID` - **Rekognition용 (필수)**
- [ ] `AWS_SECRET_ACCESS_KEY` - **Rekognition용 (필수)**
- [ ] `AWS_REGION` - **Rekognition용 (필수)**

#### 이미지 저장소 (MinIO 또는 AWS S3)
- [ ] `MINIO_ENDPOINT` - MinIO/S3 엔드포인트
- [ ] `MINIO_ACCESS_KEY` - S3 Access Key
- [ ] `MINIO_SECRET_KEY` - S3 Secret Key
- [ ] `MINIO_BUCKET_NAME` - 버킷 이름
- [ ] `MINIO_PUBLIC_URL` - 공개 이미지 URL

#### 선택사항 (Optional)
- [ ] `RESEND_API_KEY` - 이메일 알림용
- [ ] `FROM_EMAIL` - 발신자 이메일

### 배포 플랫폼별 체크리스트

#### Railway
- [ ] GitHub 저장소 연결
- [ ] Root Directory: `backend` 설정
- [ ] 모든 환경 변수 입력
- [ ] 배포 완료 확인
- [ ] Health check 통과 확인

#### Render
- [ ] GitHub 저장소 연결
- [ ] Root Directory: `backend` 설정
- [ ] 모든 환경 변수 입력
- [ ] 배포 완료 확인

#### Heroku
- [ ] Heroku 앱 생성
- [ ] 모든 환경 변수 설정 (`heroku config:set`)
- [ ] 배포 완료 확인

---

## Frontend 배포

### 환경 변수 체크리스트

- [ ] `EXPO_PUBLIC_API_URL` - Backend API URL (HTTPS)
- [ ] `EXPO_PUBLIC_AUTH0_DOMAIN` - Auth0 도메인
- [ ] `EXPO_PUBLIC_AUTH0_CLIENT_ID` - Auth0 Client ID
- [ ] `EXPO_PUBLIC_AUTH0_REDIRECT_URI` - 배포된 웹 앱 URL
- [ ] `EXPO_PUBLIC_AUTH0_AUDIENCE` - Auth0 Audience

### 배포 플랫폼별 체크리스트

#### Vercel
- [ ] Vercel CLI 설치 및 로그인
- [ ] `npm run build:web` 성공
- [ ] `vercel --prod` 배포 완료
- [ ] 환경 변수 설정 완료
- [ ] 재배포 완료

#### Netlify
- [ ] Netlify CLI 설치 및 로그인
- [ ] `netlify.toml` 생성
- [ ] `npm run build:web` 성공
- [ ] `netlify deploy --prod` 완료
- [ ] 환경 변수 설정 완료

---

## 배포 후 테스트

### 필수 테스트 항목

1. **웹 앱 접속**
   - [ ] 배포된 URL 접속 성공
   - [ ] 페이지 로드 정상

2. **인증 (Auth0)**
   - [ ] 로그인 버튼 클릭
   - [ ] Auth0 로그인 페이지 표시
   - [ ] 로그인 성공 후 리다이렉트
   - [ ] 로그아웃 작동

3. **이미지 자동 태깅 (MVP 핵심 기능)**
   - [ ] 아이템 생성 시 이미지 업로드
   - [ ] **자동 태그 생성 확인** (예: ["phone", "electronics"])
   - [ ] Backend 로그에서 `✅ AWS Rekognition client initialized` 확인
   - [ ] 태그로 검색 가능한지 확인

4. **검색 기능**
   - [ ] 텍스트 검색 작동
   - [ ] 자동 태그로 검색 작동
   - [ ] 위치 필터 작동

5. **이미지 표시**
   - [ ] 업로드한 이미지 표시
   - [ ] 이미지 URL 정상 작동

6. **Claim 기능**
   - [ ] Claim 제출 성공
   - [ ] 이메일 알림 (Resend 설정 시)

---

## 문제 해결

### AWS Rekognition이 작동하지 않는 경우

1. **Backend 로그 확인**:
   ```
   ✅ AWS Rekognition client initialized  ← 이게 보여야 함
   ```
   만약 `⚠️ AWS Rekognition not configured`가 보이면:
   - 환경 변수 3개 모두 설정되었는지 확인
   - 오타 없는지 확인
   - Railway/Render에서 환경 변수 저장 후 재배포

2. **IAM 권한 확인**:
   - IAM 사용자에 `AmazonRekognitionReadOnlyAccess` 정책이 있는지 확인

3. **리전 확인**:
   - `AWS_REGION`이 올바른지 확인 (예: `us-west-2`)

4. **테스트**:
   - 이미지 업로드 후 `tagsSuggested` 배열이 비어있지 않은지 확인

### 이미지가 표시되지 않는 경우

- `MINIO_PUBLIC_URL`이 올바른지 확인
- CORS 설정 확인
- 버킷이 공개 읽기 가능한지 확인

### Auth0 리다이렉트 오류

- Auth0 Dashboard → Applications → Settings
- **Allowed Callback URLs**에 배포된 URL 추가
- `EXPO_PUBLIC_AUTH0_REDIRECT_URI`와 일치하는지 확인

---

## 배포 완료 후

- [ ] 모든 테스트 통과
- [ ] GitHub README에 배포 URL 추가
- [ ] 포트폴리오에 배포 링크 추가
- [ ] 데모용 스크린샷 준비 (모바일 앱)

---

## 참고 문서

- [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md) - 상세 배포 가이드
- [MINIO_DEPLOYMENT.md](./MINIO_DEPLOYMENT.md) - MinIO/S3 설정
- [RESEND_SETUP.md](./RESEND_SETUP.md) - 이메일 서비스 설정

