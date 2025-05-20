import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * 현재 인증된 사용자 정보를 반환하는 엔드포인트
 */
router.get('/me', authenticate, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
      message: '인증되지 않은 사용자입니다.',
    });
  }
  
  // 사용자 정보 반환
  return res.json({
    authenticated: true,
    user: req.user,
  });
});

/**
 * 토큰 유효성을 검증하는 엔드포인트
 */
router.post('/verify', authenticate, (req, res) => {
  return res.json({
    valid: !!req.user,
    user: req.user || null,
  });
});

export default router; 