import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// Auth0 설정이 있으면 실제 JWT 검증, 없으면 개발 모드
export const authenticate = AUTH0_DOMAIN && AUTH0_AUDIENCE ? 
  auth({
    issuerBaseURL: `https://${AUTH0_DOMAIN}`,
    audience: AUTH0_AUDIENCE,
    tokenSigningAlg: 'RS256',
    allowAnonymous: true, // 토큰 없어도 req.auth = undefined로 설정
  }) : 
  (req, res, next) => {
    console.warn('⚠️  개발 모드: Auth0 인증이 비활성화되었습니다');
    req.auth = undefined;
    next();
  };

/* 보호된 라우트용 미들웨어 */
export function requireAuth(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ 
      message: '인증이 필요합니다. 로그인 후 다시 시도해주세요.',
      error: 'UNAUTHORIZED'
    });
  }
  next();
}
