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
      // Public endpoints에서 인증 오류는 정상이므로 로그를 줄임
      const isPublicEndpoint = ['/test', '/env-check', '/'].includes(req.path);
      if (!isPublicEndpoint && process.env.NODE_ENV === 'production') {
        // 프로덕션에서만 protected 엔드포인트의 인증 오류 로그
        console.warn('⚠️  JWT token error (ignoring and continuing):', err.message);
      }
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