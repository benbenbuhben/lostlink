# EC2 Backend 배포 가이드

AWS EC2에 Backend를 배포하는 완전한 가이드입니다.

---

## 📋 개요

- **Frontend**: Vercel (이미 배포 완료)
- **Backend**: AWS EC2
- **이미지**: AWS S3 (이미 설정 완료)
- **데이터베이스**: MongoDB Atlas (무료 티어)

> 💡 **MongoDB Atlas 설정**: [ATLAS_QUICK_SETUP.md](./ATLAS_QUICK_SETUP.md) 참고 (5분 완료!)

---

## Step 1: EC2 인스턴스 생성

### 1.1 AWS Console 접속

1. [AWS Console](https://console.aws.amazon.com/) → EC2 서비스

### 1.2 인스턴스 시작

1. **Launch Instance** 클릭

2. **Name**: `lostlink-backend`

3. **Application and OS Images (AMI)**:
   - **Amazon Linux 2023** 선택 (무료 티어)
   - 또는 **Ubuntu 22.04 LTS**

4. **Instance type**:
   - **t2.micro** (무료 티어) - 포트폴리오용으로 충분 ✅
     - 1 vCPU, 1GB RAM
     - 무료 (12개월) → $7-10/월
     - ⚠️ 일부 리전에서만 무료 티어 가능 (us-east-1, us-west-2 등)
   - **t3.micro** (무료 티어 아님) - 약 $7-10/월
     - 1 vCPU, 1GB RAM
     - t2.micro보다 약간 빠름
   - **t3.small** (여유 있게) - 약 $15-20/월
     - 2 vCPU, 2GB RAM
   
   **추천**: 포트폴리오용이면 **t2.micro** (무료 티어)로 충분합니다!

5. **Key pair (login)**:
   - **Create new key pair** 클릭
   - Name: `lostlink-backend-key`
   - Key pair type: **RSA**
   - Private key file format: **.pem**
   - **Create key pair** 클릭 → 자동 다운로드됨
   - ⚠️ **중요**: 이 파일을 안전한 곳에 보관!

6. **Network settings**:
   - **Allow HTTP traffic from the internet** 체크
   - **Allow HTTPS traffic from the internet** 체크
   - **Allow SSH traffic from** → **My IP** (보안)

7. **Configure storage**:
   - **20-30 GB** 권장 (MongoDB 데이터 저장 공간 확보)
   - 무료 티어: 8GB (추가 스토리지 비용 발생 가능)
   - 추가 스토리지: $0.10/GB/월 (예: 20GB = $1.20/월)

8. **Launch instance** 클릭

---

## Step 2: EC2 인스턴스 접속

### 2.1 EC2 Public IP 확인 (먼저!)

1. **AWS Console** → **EC2** 서비스
2. 왼쪽 메뉴에서 **Instances** 클릭
3. 생성한 인스턴스 선택 (체크박스 클릭)
4. 아래 **Details** 탭에서 **Public IPv4 address** 확인
   - 예: `54.123.45.67`
5. 이 IP를 복사해두세요!

**또는 인스턴스 목록에서 바로 확인:**
- 인스턴스 목록 테이블에서 **Public IPv4 address** 컬럼 확인

---

### 2.2 SSH 접속

**Mac/Linux:**
```bash
# 1. 키 파일 권한 설정 (처음 한 번만)
chmod 400 ~/Downloads/lostlink-backend-key.pem

# 2. SSH 접속 (YOUR-EC2-PUBLIC-IP를 실제 IP로 교체)
ssh -i ~/Downloads/lostlink-backend-key.pem ec2-user@54.123.45.67
```

**Windows (PowerShell):**
```powershell
# WSL 또는 Git Bash 사용
# 1. 키 파일 권한 설정
icacls C:\path\to\lostlink-backend-key.pem /inheritance:r
icacls C:\path\to\lostlink-backend-key.pem /grant:r "%username%:R"

# 2. SSH 접속
ssh -i C:\path\to\lostlink-backend-key.pem ec2-user@54.123.45.67
```

**참고**: 
- Amazon Linux: `ec2-user`
- Ubuntu: `ubuntu`

**예시:**
```bash
# Public IP가 54.123.45.67인 경우
ssh -i ~/Downloads/lostlink-backend-key.pem ec2-user@54.123.45.67
```

---

## Step 3: 서버 환경 설정

### 3.1 시스템 업데이트

```bash
# Amazon Linux 2023
sudo dnf update -y

# Ubuntu
sudo apt update && sudo apt upgrade -y
```

### 3.2 Node.js 설치

**Amazon Linux 2023:**
```bash
# Node.js 20.x 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version  # v20.x.x 확인
npm --version
```

**Ubuntu:**
```bash
# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # v20.x.x 확인
npm --version
```

### 3.3 PM2 설치 (프로세스 관리)

```bash
sudo npm install -g pm2
pm2 --version
```

### 3.4 Git 설치

```bash
# Amazon Linux
sudo dnf install -y git

# Ubuntu
sudo apt install -y git
```

---

## Step 4: 코드 배포

### 4.1 프로젝트 클론

```bash
cd ~
git clone https://github.com/benbenbuhben/lostlink.git
cd lostlink/backend
```

### 4.2 의존성 설치

```bash
npm install --production
```

### 4.3 환경 변수 설정

```bash
# .env 파일 생성
nano .env
```

다음 내용 입력:

```bash
NODE_ENV=production
PORT=5000

# MongoDB Atlas (ATLAS_QUICK_SETUP.md 참고)
MONGO_URI=mongodb+srv://lostlink-user:YOUR_PASSWORD@lostlink-cluster.xxxxx.mongodb.net/lostlink?retryWrites=true&w=majority

# AWS S3
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=your-aws-s3-access-key
MINIO_SECRET_KEY=your-aws-s3-secret-key
MINIO_BUCKET_NAME=lostlink-uploads
MINIO_REGION=us-west-2
MINIO_PUBLIC_URL=https://lostlink-uploads.s3.us-west-2.amazonaws.com

# Auth0
AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
AUTH0_AUDIENCE=https://lostlink-api

# AWS Rekognition
AWS_ACCESS_KEY_ID=your-rekognition-key
AWS_SECRET_ACCESS_KEY=your-rekognition-secret
AWS_REGION=us-west-2

# Resend (선택사항)
RESEND_API_KEY=your-resend-key
FROM_EMAIL=lostlink@thomasha.dev
```

저장: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 5: PM2로 앱 실행

### 5.1 PM2로 시작

```bash
cd ~/lostlink/backend
pm2 start index.js --name lostlink-backend
pm2 save
pm2 startup
# 출력된 명령어 복사해서 실행
```

### 5.2 상태 확인

```bash
pm2 status
pm2 logs lostlink-backend
```

---

## Step 6: Nginx 설정 (리버스 프록시)
::
### 6.1 Nginx 설치

```bash
# Amazon Linux
sudo dnf install -y nginx

# Ubuntu
sudo apt install -y nginx
```

### 6.2 Nginx 설정

```bash
sudo nano /etc/nginx/conf.d/lostlink.conf
```

다음 내용 입력:

```nginx
server {
    listen 80;
    server_name YOUR-EC2-PUBLIC-IP;  # 또는 도메인

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

저장 후:

```bash
# Nginx 설정 테스트
sudo nginx -t

# Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.3 방화벽 설정

**⚠️ 중요**: EC2는 **AWS Security Groups**로 방화벽을 관리합니다. 인스턴스 내부의 방화벽 설정은 **선택사항**입니다.

**AWS Security Groups 설정 (필수 - Step 8 참고)**:
- EC2 인스턴스 생성 시 "Allow HTTP/HTTPS traffic"을 체크했다면 이미 설정됨
- 추가 설정은 **Step 8: 보안 그룹 설정** 참고

**인스턴스 내부 방화벽 (선택사항)**:

만약 인스턴스 내부 방화벽을 설정하려면:

**Amazon Linux 2023**:
```bash
# firewalld 설치 확인
sudo systemctl status firewalld

# firewalld가 없으면 설치
sudo dnf install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 포트 열기
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Ubuntu**:
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # SSH
sudo ufw enable
```

**참고**: Security Groups가 이미 설정되어 있다면 인스턴스 내부 방화벽은 설정하지 않아도 됩니다!

---

## Step 7: SSL 인증서 설정 (Let's Encrypt)

### 7.1 Certbot 설치

```bash
# Amazon Linux
sudo dnf install -y certbot python3-certbot-nginx

# Ubuntu
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 도메인이 있는 경우

```bash
sudo certbot --nginx -d your-domain.com
```

### 7.3 도메인이 없는 경우

EC2 Public IP로만 접근하려면:
- SSL 인증서 없이 HTTP로 사용
- 또는 AWS Certificate Manager (ACM) 사용

---

## Step 8: 보안 그룹 설정

### 8.1 EC2 보안 그룹 편집

1. EC2 Dashboard → Instances → 인스턴스 선택
2. **Security** 탭 → **Security groups** 클릭
3. **Inbound rules** → **Edit inbound rules**

### 8.2 규칙 추가

| Type | Protocol | Port Range | Source |
|------|----------|------------|--------|
| SSH | TCP | 22 | My IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 5000 | 127.0.0.1/32 (로컬만) |

---

## Step 9: 테스트

### 9.1 Backend 확인

```bash
# EC2에서
curl http://localhost:5000/health
# 또는
curl http://YOUR-EC2-PUBLIC-IP/health
```

### 9.2 브라우저에서 확인

```
http://YOUR-EC2-PUBLIC-IP
```

### 9.3 Frontend 환경 변수 업데이트

Vercel Dashboard → Environment Variables:
```
EXPO_PUBLIC_API_URL=http://YOUR-EC2-PUBLIC-IP
```

---

## Step 10: 자동 배포 설정 (선택사항)

### 10.1 GitHub Actions 설정

`.github/workflows/deploy-backend.yml` 생성:

```yaml
name: Deploy Backend to EC2

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/lostlink
            git pull
            cd backend
            npm install --production
            pm2 restart lostlink-backend
```

---

## 🔍 문제 해결

### PM2가 시작되지 않는 경우

```bash
pm2 logs lostlink-backend
# 에러 확인 후 수정
pm2 restart lostlink-backend
```

### Nginx 502 Bad Gateway

```bash
# Backend가 실행 중인지 확인
pm2 status

# 포트 확인
sudo netstat -tlnp | grep 5000
```

### 환경 변수 문제

```bash
# .env 파일 확인
cat ~/lostlink/backend/.env

# PM2 재시작
pm2 restart lostlink-backend --update-env
```

---

## 💰 비용

### EC2 무료 티어 (12개월)

- **t2.micro**: 무료 (일부 리전만: us-east-1, us-west-2 등)
- **스토리지**: 30GB 무료 (EBS)
- **데이터 전송**: 15GB 무료

### 무료 티어 이후

- **t2.micro**: 약 $7-10/월
- **t3.micro**: 약 $7-10/월 (무료 티어 아님)
- **추가 스토리지**: $0.10/GB/월
  - 20GB 추가 = $2/월
  - 30GB 추가 = $3/월
- **데이터 전송**: $0.09/GB

### 스토리지 예상 사용량

**LostLink 앱 데이터 크기:**
- 아이템 1개: 약 1-5KB (텍스트만, 이미지는 S3)
- 1,000개 아이템: 약 5MB
- 10,000개 아이템: 약 50MB
- MongoDB 인덱스: 약 10-20MB
- **총 예상**: 100MB ~ 1GB (대부분의 경우)

**8GB면 충분하지만**, 여유를 위해 **20-30GB 권장**

---

## 🔄 스토리지 확장 방법

### EC2 인스턴스 생성 후 스토리지 확장

1. EC2 Dashboard → Volumes
2. 인스턴스의 볼륨 선택
3. **Actions** → **Modify Volume**
4. 크기 변경 (예: 8GB → 20GB)
5. 인스턴스에서 파일 시스템 확장:

```bash
# Amazon Linux
sudo growpart /dev/xvda 1
sudo xfs_growfs /

# Ubuntu
sudo growpart /dev/nvme0n1 1
sudo resize2fs /dev/nvme0n1p1
```

### 스토리지 모니터링

```bash
# 디스크 사용량 확인
df -h

# MongoDB 데이터 크기 확인
du -sh /var/lib/mongodb
```

---

## ✅ 체크리스트

- [ ] EC2 인스턴스 생성
- [ ] SSH 접속 성공
- [ ] Node.js 설치
- [ ] PM2 설치
- [ ] 코드 클론
- [ ] 환경 변수 설정
- [ ] PM2로 앱 실행
- [ ] Nginx 설정
- [ ] 보안 그룹 설정
- [ ] Backend 테스트
- [ ] Frontend 환경 변수 업데이트
- [ ] 전체 플로우 테스트

---

## 📚 참고

- [AWS EC2 공식 문서](https://docs.aws.amazon.com/ec2/)
- [PM2 문서](https://pm2.keymetrics.io/)
- [Nginx 문서](https://nginx.org/en/docs/)

---

돌아오시면 이 가이드대로 진행하시면 됩니다! 🚀

