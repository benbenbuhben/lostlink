# Task Tracker – LostLink MVP

## 1. Project Setup
- [x] 1.1 Create a new repository with `frontend/` and `backend/` folders.
- [x] 1.2 Add `prd.md`, Docker Compose file, and `.env` to the project root.
- [x] 1.3 Set up Node.js + Express in the backend directory.
- [ ] 1.4 Initialize GitHub Actions for CI/CD.

## 2. Authentication Flow
- [~] 2.1 Integrate Auth0 for user authentication in both frontend and backend.  
      _Frontend Auth0 login working via `AuthContext`; backend JWT middleware still pending._
- [x] 2.2 Implement login screen / flow in the frontend.
- [~] 2.3 Create backend Auth endpoints / middleware.
- [x] 2.4 Display clear auth-related error messages.

## 3. Report Found Item
- [x] 3.1 Design and implement the *Report* form in the frontend.
- [x] 3.2 Validate required fields (photo, title, location).
- [x] 3.3 Create backend `POST /items` endpoint (basic implementation in `itemController.createItem`).
- [x] 3.4 Integrate MinIO (S3-compatible) for photo uploads.
- [x] 3.5 Persist uploaded item metadata in MongoDB.
- [~] 3.6 Optimistically prepend new item to Feed after submission.  _Currently triggers query invalidation; true optimistic prepend still TODO._

## 4. Feed & Search
- [x] 4.1 Scrollable Feed UI in the frontend (React Native + React Query).
- [x] 4.2 Infinite scroll (`useInfiniteQuery` + page size = 10).
- [x] 4.3 Backend `GET /items` with pagination, search, and location filter support.
- [ ] 4.4 Search bar + location filter UI in the frontend.
- [ ] 4.5 Optimise backend queries (< 500 ms search latency).
- [~] 4.6 Feed loads in < 1 s (meets target locally; needs formal perf check).

## 5. Claim Functionality
- [ ] 5.1 *Submit Claim* button in item detail (disabled when logged-out).
- [x] 5.2 Backend `POST /items/:id/claim` endpoint scaffolded (`claimController`).
- [ ] 5.3 Integrate SendGrid email on claim submission.
- [ ] 5.4 Confirmation view in the frontend.
- [ ] 5.5 Ensure confirmation email delivered < 1 minute.

## 6. Responsive UI & Polish
- [ ] 6.1 Mobile-first layout verified on iOS & Android (Expo).
- [ ] 6.2 Consistent styling + error handling.
- [ ] 6.3 End-to-end testing of all flows.
- [ ] 6.4 Accessibility & UX polish.

## 7. Deployment
- [ ] 7.1 Publish Expo build to TestFlight / Play Store.
- [ ] 7.2 Build & push backend Docker image (AWS/Heroku).
- [ ] 7.3 Provision production DB (MongoDB Atlas) + S3.
- [ ] 7.4 Configure production env vars.
