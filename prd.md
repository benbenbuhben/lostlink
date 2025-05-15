# PRD: LostLink MVP

## 1. Purpose
Provide a mobile-first lost & found system for organizations so users can quickly report, browse, and claim items within a shared space.

## 2. Scope

### In-Scope (v1 MVP)
- **User authentication**: Email/password signup & login via Auth0  
- **Report Found Item**  
  - Upload photo + title + description + pickup location  
- **Browse Found Items**  
  - Scrollable feed of recent items  
  - Search by keyword & filter by location  
- **Submit Claim**  
  - Send a claim request on an item you believe is yours  
- **Basic notifications**  
  - Email confirmation on successful claim submission  

### Out-of-Scope (v1 MVP)
- AI/ML tag suggestions & automated matching  
- Item resale or auction features  
- Push notifications or real-time updates  
- Advanced user profiles or settings  

## 3. User Stories
1. **Sign up / Log in**  
   As a user, I want to register and log in securely so I can report or claim items.  
2. **Report found item**  
   As a user, I want to fill out a form with photo, title, description, and location so others can see what I found.  
3. **View feed**  
   As a user, I want to browse a feed of recently found items sorted by date.  
4. **Search & filter**  
   As a user, I want to search by keyword (e.g. "wallet") and filter by location so I can find relevant items quickly.  
5. **Claim item**  
   As a user, I want to submit a claim request on an item page so I can start the recovery process.  
6. **Confirmation email**  
   As a user, I want to receive an email when my claim is submitted so I know it went through.

## 4. Acceptance Criteria
- **Auth**  
  - New users can register; errors shown if email already taken  
  - Login issues return clear error messages  
- **Report Found Item**  
  - Form validates required fields (photo + title + location)  
  - Upon success, item appears at top of feed  
- **Feed**  
  - Feed loads in under 1 s and supports infinite scroll (page size = 10)  
  - Search returns matching titles/descriptions in under 500 ms  
- **Claim**  
  - "Submit Claim" button disabled until user is logged in  
  - Confirmation email arrives within 1 minute of submission  
- **Responsive UI**  
  - Screens render correctly on both iOS and Android (via Expo)  

## 5. Tech Stack

### Local Development
- **Docker Compose** bringing up:  
  - `api` (Node.js + Express)  
  - `mongo` (MongoDB)  
  - `minio` (S3-compatible storage)  
  - `mongo-express` (web-based MongoDB admin UI)  
- **Env vars** via `.env` in project root  
- **Frontend**: Expo CLI running on host machine (Metro on 19001), pointing API calls to `http://localhost:5001`

### Production
- **Database**: MongoDB Atlas  
- **Storage**: AWS S3 (pre-signed URLs)  
- **Container registry**: AWS ECR (for future AWS deploys)  

### Core Services
- **Frontend**: React Native + Expo  
- **Auth**: Auth0 SDK  
- **Backend**: Node.js + Express  
- **Email**: SendGrid (transactional emails)  

### CI/CD
- **GitHub Actions**  
  - Lint & test frontend (`frontend/`) and backend (`backend/`)  
  - Build & publish Expo app (TestFlight / Play Store)  
  - Build & push backend Docker image (for later AWS or Heroku deploy)  

## 6. Milestones
1. **Project setup** – ✅ completed
   - Repo + `frontend/` & `backend/` folders  
   - `prd.md` + Docker Compose + `.env`  
2. **Auth flow** – 🟡 frontend completed; backend token validation pending  
   - Integrate Auth0, signup/login screens & endpoints  
3. **Report Found Item** – 🔜 next up  
   - Backend `/items` POST + MinIO upload logic  
   - "Report" screen in app  
4. **Feed & Search** – ✅ initial feed live (pagination & infinite scroll); search UI pending  
   - Backend `/items` GET with query params  
   - Feed UI + search bar  
5. **Claim functionality** – 🔜 not started  
   - `/items/:id/claim` POST + SendGrid email  
   - Claim button & confirmation view  
6. **Polish & Deploy** – ⏳ later  
   - Styling, error handling, end-to-end testing  
   - Publish Expo build & deploy backend container

## 7. Implementation Sprint Order
1. Wire router + tabs.
   * Delete placeholder `explore.tsx` and rename the existing `index.tsx` tab to **Feed**.
   * Update `(tabs)/_layout.tsx` to declare the four production tabs:
     - `index`  → title **Feed** (house icon)
     - `report` → title **Report** (camera-plus or plus-circle icon)
     - `search` → title **Search** (magnifying glass icon)
     - `profile` (optional) → title **Profile** (person icon)
   * Verify the bottom bar now reflects the LostLink IA (information architecture) before building new screens.