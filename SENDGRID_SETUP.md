# SendGrid 설정 가이드

## 📧 SendGrid 무료 티어 설정

### 1. SendGrid 계정 생성

1. **SendGrid 가입**
   - https://sendgrid.com 접속
   - "Start for free" 클릭
   - 이메일로 가입 (무료)

2. **계정 인증**
   - 이메일 확인
   - 전화번호 인증 (필수)

### 2. Single Sender Verification

**중요:** SendGrid는 발신자 이메일을 검증해야 합니다.

1. **SendGrid 대시보드** → **Settings** → **Sender Authentication**
2. **Single Sender Verification** 클릭
3. **Create New Sender** 클릭
4. 정보 입력:
   - **From Email**: `rackoon1030@gmail.com` (또는 사용할 이메일)
   - **From Name**: `LostLink`
   - **Reply To**: 같은 이메일
   - **Address**: 주소 입력
   - **City**: 도시 입력
   - **State**: 주/도 입력
   - **Country**: 국가 선택
   - **Zip Code**: 우편번호

5. **Create** 클릭
6. **이메일 확인**: SendGrid에서 보낸 확인 이메일을 열고 링크 클릭

### 3. API 키 생성

1. **SendGrid 대시보드** → **Settings** → **API Keys**
2. **Create API Key** 클릭
3. **API Key Name**: `LostLink Production` (또는 원하는 이름)
4. **API Key Permissions**: **Full Access** 선택 (또는 **Mail Send**만)
5. **Create & View** 클릭
6. **⚠️ 중요:** API 키를 복사해두세요! (한 번만 보여줍니다)
   - 예: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. 환경 변수 설정

#### 로컬 개발 (.env 파일)

프로젝트 루트에 `.env` 파일 생성 (이미 있으면 수정):

```bash
# SendGrid
SENDGRID_API_KEY=SG.your-actual-api-key-here
FROM_EMAIL=rackoon1030@gmail.com
```

#### Docker Compose (이미 설정됨)

`docker-compose.yml`에 이미 설정되어 있습니다:

```yaml
- SENDGRID_API_KEY=${SENDGRID_API_KEY:-SG.your-sendgrid-api-key-here}
- FROM_EMAIL=rackoon1030@gmail.com
```

**실제 API 키를 사용하려면:**

1. `.env` 파일에 `SENDGRID_API_KEY` 추가
2. 또는 환경 변수로 직접 설정:
   ```bash
   export SENDGRID_API_KEY=SG.your-actual-api-key
   docker-compose up -d
   ```

### 5. 테스트

1. **백엔드 재시작:**
   ```bash
   docker-compose restart backend
   ```

2. **로그 확인:**
   ```bash
   docker-compose logs backend | grep SendGrid
   ```
   
   성공 시:
   ```
   ✅ SendGrid initialized successfully
   ```

3. **Claim 제출 테스트:**
   - 앱에서 아이템에 Claim 제출
   - `rackoon1030@gmail.com`으로 이메일 도착 확인

### 6. 무료 티어 제한

- ✅ **하루 100개 이메일** 무료
- ✅ **월 3,000개 이메일** 무료
- ✅ LostLink 프로젝트에는 충분함

### 7. 문제 해결

#### 이메일이 안 갈 때

1. **Single Sender Verification 확인**
   - SendGrid 대시보드 → Sender Authentication
   - 이메일이 "Verified" 상태인지 확인

2. **API 키 확인**
   ```bash
   docker exec lostlink-backend printenv | grep SENDGRID
   ```

3. **로그 확인**
   ```bash
   docker-compose logs backend | grep -i sendgrid
   ```

4. **SendGrid Activity 확인**
   - SendGrid 대시보드 → Activity
   - 이메일 전송 시도 확인
   - 실패 시 에러 메시지 확인

#### 403 Forbidden 에러

- Single Sender Verification이 안 되어 있음
- 이메일 확인 링크 클릭 필요

#### API 키 오류

- API 키가 잘못 복사됨
- 공백이나 특수문자 확인
- 새 API 키 생성 후 재시도

### 8. 배포 시 주의사항

**프로덕션 환경 변수 설정:**

배포 플랫폼 (Heroku, AWS, Vercel 등)에서:

```bash
SENDGRID_API_KEY=SG.your-actual-api-key
FROM_EMAIL=rackoon1030@gmail.com
```

**⚠️ 보안:**
- API 키를 **절대** GitHub에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있음
- 환경 변수로만 관리

---

## ✅ 완료 체크리스트

- [ ] SendGrid 계정 생성
- [ ] Single Sender Verification 완료
- [ ] API 키 생성 및 복사
- [ ] `.env` 파일에 `SENDGRID_API_KEY` 추가
- [ ] 백엔드 재시작
- [ ] 로그에서 "✅ SendGrid initialized successfully" 확인
- [ ] Claim 제출 테스트
- [ ] 이메일 수신 확인

---

## 📝 빠른 설정 (요약)

```bash
# 1. .env 파일 생성/수정
echo "SENDGRID_API_KEY=SG.your-actual-api-key" >> .env
echo "FROM_EMAIL=rackoon1030@gmail.com" >> .env

# 2. 백엔드 재시작
docker-compose restart backend

# 3. 확인
docker-compose logs backend | grep SendGrid
```

---

**도움이 필요하면:** SendGrid 문서: https://docs.sendgrid.com

