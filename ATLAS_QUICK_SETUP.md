# MongoDB Atlas 빠른 설정 가이드

5분 안에 완료! 🚀

---

## Step 1: 계정 생성 및 클러스터 생성

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 접속
2. **Sign Up** (Google 계정으로 빠르게 가능)
3. **Build a Database** 클릭

---

## Step 2: 클러스터 설정

1. **Deployment**:
   - **FREE** (M0) 선택 ✅

2. **Cloud Provider & Region**:
   - AWS 선택
   - 가장 가까운 리전 선택 (예: `us-west-2`)

3. **Cluster Name**:
   - `lostlink-cluster` (또는 원하는 이름)

4. **Create Deployment** 클릭

---

## Step 3: Database User 생성

1. **Database Access** → **Add New Database User**

2. 설정:
   - **Authentication Method**: Password
   - **Username**: `lostlink-user` (또는 원하는 이름)
   - **Password**: 강력한 비밀번호 생성 (복사해두기!)
   - **Database User Privileges**: **Atlas admin** 선택

3. **Add User** 클릭

---

## Step 4: Network Access 설정

1. **Network Access** → **Add IP Address**

2. **Access List Entry**:
   - **Add Current IP Address** 클릭 (자동으로 현재 IP 추가)
   - 또는 **Allow Access from Anywhere** 선택: `0.0.0.0/0` 입력
   - ⚠️ 개발/포트폴리오용이면 `0.0.0.0/0` 괜찮음

3. **Confirm** 클릭

---

## Step 5: Connection String 가져오기

1. **Database** → **Connect** 클릭

2. **Connect your application** 선택

3. **Driver**: Node.js, **Version**: 5.5 or later

4. **Connection String** 복사:
   ```
   mongodb+srv://lostlink-user:<password>@lostlink-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **중요**: `<password>`를 실제 비밀번호로 교체
6. 데이터베이스 이름 추가: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority` 뒤에 `/lostlink` 추가
   ```
   mongodb+srv://lostlink-user:YOUR_PASSWORD@lostlink-cluster.xxxxx.mongodb.net/lostlink?retryWrites=true&w=majority
   ```

---

## Step 6: EC2에서 사용

EC2 배포 시 환경 변수에 추가:

```bash
MONGO_URI=mongodb+srv://lostlink-user:YOUR_PASSWORD@lostlink-cluster.xxxxx.mongodb.net/lostlink?retryWrites=true&w=majority
```

---

## ✅ 완료!

이제 EC2 Backend에서 이 Connection String을 사용하면 됩니다.

**예상 시간**: 3-5분

---

## 🔍 확인 방법

EC2에서 Backend 실행 후 로그 확인:
```
MongoDB connected: lostlink-cluster.xxxxx.mongodb.net
```

---

## 💰 비용

- **무료 티어**: 512MB 스토리지, 계속 무료
- **유료**: $9/월부터 (필요시)

포트폴리오용으로는 무료 티어로 충분합니다! ✅

