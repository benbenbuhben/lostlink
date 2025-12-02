# LostLink Web Deployment Guide

This guide explains how to deploy the LostLink web application to production.

## Overview

- **Mobile App**: Not deployed (use screenshots for GitHub demo)
- **Web App**: Deployed to Vercel/Netlify (static site)
- **Backend**: Deployed separately (Heroku/Railway/Render)

---

## Prerequisites

1. **Backend API** must be deployed and accessible via HTTPS
2. **Environment Variables** configured for production
3. **GitHub Repository** with your code

---

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest option for Expo web apps.

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Build Web Export

```bash
cd frontend
npm run build:web
```

This creates a `web-build/` directory with static files.

### Step 3: Deploy to Vercel

```bash
# From the frontend directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? lostlink-web
# - Directory? ./web-build
# - Override settings? No
```

### Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
EXPO_PUBLIC_API_URL=https://your-backend-api.com
EXPO_PUBLIC_AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc
EXPO_PUBLIC_AUTH0_REDIRECT_URI=https://your-vercel-app.vercel.app
EXPO_PUBLIC_AUTH0_AUDIENCE=https://lostlink-api
```

### Step 5: Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

---

## Option 2: Deploy to Netlify

### Step 1: Build Web Export

```bash
cd frontend
npm run build:web
```

### Step 2: Create `netlify.toml`

Create `frontend/netlify.toml`:

```toml
[build]
  publish = "web-build"
  command = "npm run build:web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 3: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod --dir=web-build
```

### Step 4: Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables:

```
EXPO_PUBLIC_API_URL=https://your-backend-api.com
EXPO_PUBLIC_AUTH0_DOMAIN=dev-7zwyji3snq5201k3.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc
EXPO_PUBLIC_AUTH0_REDIRECT_URI=https://your-netlify-app.netlify.app
EXPO_PUBLIC_AUTH0_AUDIENCE=https://lostlink-api
```

---

## Option 3: GitHub Pages (Free, but more complex)

### Step 1: Build Web Export

```bash
cd frontend
npm run build:web
```

### Step 2: Configure GitHub Actions

Create `.github/workflows/deploy-web.yml`:

```yaml
name: Deploy Web to GitHub Pages

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Build web
        run: |
          cd frontend
          npm run build:web
        env:
          EXPO_PUBLIC_API_URL: ${{ secrets.EXPO_PUBLIC_API_URL }}
          EXPO_PUBLIC_AUTH0_DOMAIN: ${{ secrets.EXPO_PUBLIC_AUTH0_DOMAIN }}
          EXPO_PUBLIC_AUTH0_CLIENT_ID: ${{ secrets.EXPO_PUBLIC_AUTH0_CLIENT_ID }}
          EXPO_PUBLIC_AUTH0_REDIRECT_URI: ${{ secrets.EXPO_PUBLIC_AUTH0_REDIRECT_URI }}
          EXPO_PUBLIC_AUTH0_AUDIENCE: ${{ secrets.EXPO_PUBLIC_AUTH0_AUDIENCE }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/web-build
```

### Step 3: Configure GitHub Secrets

In GitHub → Settings → Secrets → Actions, add:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_AUTH0_DOMAIN`
- `EXPO_PUBLIC_AUTH0_CLIENT_ID`
- `EXPO_PUBLIC_AUTH0_REDIRECT_URI`
- `EXPO_PUBLIC_AUTH0_AUDIENCE`

---

## Backend Deployment

The backend needs to be deployed separately. Options:

### Option A: Railway (Easiest)

1. Connect GitHub repo to Railway
2. Select `backend` folder as root
3. Add environment variables
4. Deploy

### Option B: Render

1. Create new Web Service
2. Connect GitHub repo
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Option C: Heroku

```bash
cd backend
heroku create lostlink-api
heroku config:set MONGO_URI=...
heroku config:set AUTH0_DOMAIN=...
# ... add all env vars
git push heroku main
```

---

## Environment Variables Checklist

### Frontend (Web)

- `EXPO_PUBLIC_API_URL` - Your backend API URL (HTTPS)
- `EXPO_PUBLIC_AUTH0_DOMAIN` - Auth0 domain
- `EXPO_PUBLIC_AUTH0_CLIENT_ID` - Auth0 client ID
- `EXPO_PUBLIC_AUTH0_REDIRECT_URI` - Your web app URL
- `EXPO_PUBLIC_AUTH0_AUDIENCE` - Auth0 audience

### Backend

- `MONGO_URI` - MongoDB connection string (MongoDB Atlas)
- `MINIO_ENDPOINT` - MinIO/S3 endpoint (or use AWS S3)
- `MINIO_ACCESS_KEY` - S3 access key
- `MINIO_SECRET_KEY` - S3 secret key
- `MINIO_BUCKET_NAME` - S3 bucket name
- `MINIO_PUBLIC_URL` - Public S3 URL (for images)
- `AUTH0_DOMAIN` - Auth0 domain
- `AUTH0_AUDIENCE` - Auth0 audience
- `RESEND_API_KEY` - (Optional) Resend API key (free tier: 3,000 emails/month)
- `FROM_EMAIL` - (Optional) Email sender address
- `AWS_ACCESS_KEY_ID` - (Optional) AWS Rekognition
- `AWS_SECRET_ACCESS_KEY` - (Optional) AWS Rekognition
- `AWS_REGION` - (Optional) AWS region

---

## Testing the Deployment

1. **Web App**: Visit your deployed URL
2. **Login**: Test Auth0 authentication
3. **Create Item**: Test image upload
4. **Search**: Test search functionality
5. **Claim**: Test claim submission (email won't send without SendGrid)

---

## Troubleshooting

### Images not loading

- Check `MINIO_PUBLIC_URL` is set correctly
- Ensure MinIO/S3 bucket is publicly accessible
- Verify CORS settings on S3 bucket

### Auth0 redirect errors

- Ensure `EXPO_PUBLIC_AUTH0_REDIRECT_URI` matches your deployed URL
- Add your deployed URL to Auth0 Allowed Callback URLs

### API connection errors

- Verify `EXPO_PUBLIC_API_URL` is correct
- Check backend CORS settings allow your web domain
- Ensure backend is deployed and running

---

## Mobile App Screenshots for GitHub

Since the mobile app is not deployed, take screenshots for your GitHub README:

1. **Feed Screen** - Show list of items
2. **Report Screen** - Show form with image picker
3. **Search Screen** - Show search functionality
4. **Item Detail** - Show item details with claim button
5. **Profile Screen** - Show user profile

Add these screenshots to your GitHub README to demonstrate mobile functionality.

---

## Notes

- **Resend**: Email notifications won't work without a valid Resend API key. Free tier: 3,000 emails/month, 100/day. See [RESEND_SETUP.md](./RESEND_SETUP.md) for setup.
- **AWS Rekognition**: Image tagging won't work without AWS credentials
- **MinIO**: In production, use AWS S3 or similar instead of local MinIO
- **MongoDB**: Use MongoDB Atlas for production database

