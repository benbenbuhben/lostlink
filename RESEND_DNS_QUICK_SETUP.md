# Resend DNS 레코드 빠른 설정 가이드

## 현재 상황
- AWS SES 레코드가 이미 있음 (그대로 두면 됨)
- Resend용 레코드를 추가로 추가해야 함

## 추가해야 할 레코드 (3개)

### 1. SPF 레코드 (TXT) - 루트 도메인
```
Host: @
Type: TXT
Value: v=spf1 include:resend.com ~all
TTL: 30 min
```

**중요:** 
- 기존 AWS SES SPF 레코드(`send` 서브도메인)는 그대로 두세요
- 루트 도메인(`@`)에 Resend용 SPF를 추가하세요
- 여러 SPF 레코드가 있으면 모두 합쳐서 하나로 만들어야 할 수도 있지만, 서브도메인과 루트는 별개로 관리 가능

### 2. DKIM 레코드 (TXT) - Resend 제공값 사용
```
Host: resend._domainkey
Type: TXT
Value: [Resend 대시보드에서 복사한 전체 값]
TTL: 30 min
```

**참고:** 
- Resend 대시보드 → Domains → `thomasha.dev` → DNS Records에서 정확한 값을 복사
- 값이 매우 길 수 있음 (p=로 시작하는 긴 문자열)

### 3. DMARC 레코드 (TXT) - 선택사항
```
Host: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:rackoon1030@gmail.com
TTL: 30 min
```

**참고:**
- 이미 `_dmarc` 레코드가 있으면 기존 것을 수정하거나 새로 추가
- 여러 DMARC 레코드는 충돌할 수 있으니 하나만 유지

## 단계별 가이드

1. **Resend 대시보드에서 정확한 값 확인:**
   - [resend.com/domains](https://resend.com/domains) 접속
   - `thomasha.dev` 클릭
   - "DNS Records" 섹션에서 정확한 레코드 복사

2. **DNS 관리 페이지에서 추가:**
   - "+ Add record" 클릭
   - Type: TXT 선택
   - 위의 3개 레코드 추가

3. **확인:**
   - "IN PROPAGATION" 상태가 보이면 정상
   - 5-30분 후 Resend 대시보드에서 "Verified" 상태 확인

## 주의사항

- ✅ 기존 AWS SES 레코드는 그대로 유지
- ✅ Resend용 레코드는 루트 도메인(`@`)에 추가
- ❌ `send` 서브도메인은 AWS SES용이므로 Resend와 무관
- ✅ 여러 서비스가 같은 도메인을 사용해도 문제 없음

