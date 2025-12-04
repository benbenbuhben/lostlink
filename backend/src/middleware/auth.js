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
      // 인증 오류는 정상 동작 (allowAnonymous: true)이므로 로그하지 않음
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