import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

/* ① 모든 요청에서 JWT 서명 검증 & 디코딩 */
export const authenticate = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,   // ex) dev-abc.us.auth0.com
  audience: process.env.AUTH0_AUDIENCE,                   // Auth0 → APIs → Identifier
  tokenSigningAlg: 'RS256',
  allowAnonymous: true,                                   // 토큰 없으면 req.auth = undefined
});

/* ② 보호 라우트용 미들웨어 */
export function requireAuth(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }
  next();
}
