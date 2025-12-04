import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// Flexible Auth middleware - continues even if token error occurs
export const authenticate = (req, res, next) => {
  // Development mode if Auth0 settings are missing
  if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
    console.warn('⚠️  Development mode: Auth0 configuration missing');
    req.auth = undefined;
    return next();
  }

  // 토큰이 없으면 검증 스킵 (로그 스팸 방지)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.auth = undefined;
    return next();
  }

  // Actual JWT verification middleware
  const jwtCheck = auth({
    issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
    audience: AUTH0_AUDIENCE,
    tokenSigningAlg: 'RS256',
    allowAnonymous: true, // Allow requests without token
  });

  // Continue even if JWT error occurs
  jwtCheck(req, res, (err) => {
    if (err) {
      // "no applicable key found" 에러는 무시 (로그 스팸 방지)
      // 토큰이 있지만 무효한 경우만 조용히 처리
      req.auth = undefined; // Set to undefined on error
    }
    next(); // Continue regardless of error
  });
};

/* Protected route middleware */
export function requireAuth(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ 
      message: 'Authentication required. Please login and try again.',
      error: 'UNAUTHORIZED'
    });
  }
  next();
}