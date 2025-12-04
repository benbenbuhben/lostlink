# 배포 전 체크리스트

## 1. 환경 변수 확인

Vercel Dashboard → Settings → Environment Variables에서 확인:

```
EXPO_PUBLIC_API_URL=http://localhost:5001  (또는 배포된 백엔드 URL)
EXPO_PUBLIC_AUTH0_DOMAIN=dev-p3dnd83yc74l2dvq.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc
EXPO_PUBLIC_AUTH0_REDIRECT_URI=https://your-vercel-app.vercel.app
EXPO_PUBLIC_AUTH0_AUDIENCE=https://lostlink-api
```

**중요:** `EXPO_PUBLIC_API_URL`이 로컬 백엔드(`localhost:5001`)를 가리키면 Vercel에서 접근 불가!

## 2. 배포 명령어

```bash
cd frontend
vercel --prod
```

## 3. 배포 후 확인 사항

1. **페이지가 로드되는가?** (흰 화면 아님)
2. **랜딩 페이지가 보이는가?**
3. **로그인 버튼이 작동하는가?**
4. **API 호출이 되는가?** (브라우저 콘솔 확인)

## 4. 문제 해결

### API 연결 안 될 때
- 브라우저 콘솔에서 CORS 에러 확인
- 백엔드 CORS 설정 확인
- `EXPO_PUBLIC_API_URL` 환경 변수 확인

### 로그인 안 될 때
- Auth0 설정 확인
- `EXPO_PUBLIC_AUTH0_REDIRECT_URI`가 Vercel URL과 일치하는지 확인

