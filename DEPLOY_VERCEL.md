# Vercel 배포 명령어

## 빠른 배포 (프로덕션)

```bash
cd frontend
vercel --prod
```

## 첫 배포 또는 설정 변경 후

```bash
cd frontend

# 1. 빌드 (선택사항 - Vercel이 자동으로 빌드함)
npm run build:web

# 2. 배포
vercel --prod
```

## 개발 환경 배포 (프리뷰)

```bash
cd frontend
vercel
```

## 환경 변수 확인

Vercel Dashboard → Settings → Environment Variables에서 확인:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_AUTH0_DOMAIN`
- `EXPO_PUBLIC_AUTH0_CLIENT_ID`
- `EXPO_PUBLIC_AUTH0_REDIRECT_URI`
- `EXPO_PUBLIC_AUTH0_AUDIENCE`

## 백엔드 PM2 재실행

**필요 없음** - 프론트엔드 UI만 변경했으므로 백엔드 재시작 불필요.

백엔드 코드를 변경한 경우에만:
```bash
cd backend
pm2 restart lostlink-api
# 또는
pm2 restart all
```

