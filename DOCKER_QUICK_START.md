# Docker 빠른 시작 가이드

## 일반 개발 워크플로우 (권장)

### 1. 백엔드 + DB만 Docker로 실행
```bash
docker compose up -d
```

이렇게 하면:
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081` (admin/pass123)
- MinIO: `http://localhost:9000` (minioadmin/minioadmin)
- Backend API: `http://localhost:5001`

### 2. 프론트엔드는 로컬에서 실행
```bash
cd frontend
npx expo start --web
```

## 전체 Docker 실행 (프론트엔드 포함)

### 웹 빌드 포함해서 실행
```bash
docker compose --profile build-web up -d
```

이렇게 하면:
- 모든 서비스 + 프론트엔드 웹: `http://localhost:3000`

## 유용한 명령어

### 서비스 확인
```bash
docker compose ps
```

### 로그 보기
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### 서비스 중지
```bash
docker compose down
```

### 서비스 재시작
```bash
docker compose restart backend
```

### 볼륨 삭제 (데이터 초기화)
```bash
docker compose down -v
```

## 환경 변수 설정

`.env` 파일 생성 (선택사항):
```bash
RESEND_API_KEY=your_key
FROM_EMAIL=noreply@example.com
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-west-2
```

## 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :5001
lsof -i :27017

# 다른 포트 사용하려면 docker-compose.yml 수정
```

### 컨테이너 재빌드
```bash
docker compose build --no-cache backend
docker compose up -d
```

