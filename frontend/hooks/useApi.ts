import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// API URL 설정: 환경변수 또는 프로덕션 기본값 사용
// 프로덕션에서는 https://api.thomasha.dev 사용
// 로컬 개발에서는 환경변수 또는 기본 로컬 IP 사용
const getDefaultUrl = () => {
  // 프로덕션 환경 감지 (Vercel 배포 환경)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://api.thomasha.dev';
  }
  // 로컬 개발 환경
  return 'http://192.168.254.29:5001';
};

const RAW_URL = process.env.EXPO_PUBLIC_API_URL ?? getDefaultUrl();
const API_URL = RAW_URL.replace(/\/+$/, ''); // Remove trailing slash

// 빌드 시점에 API URL 로그 (디버깅용)
if (typeof window !== 'undefined') {
  console.log('🌐 API URL configured:', API_URL);
  console.log('🌐 EXPO_PUBLIC_API_URL from env:', process.env.EXPO_PUBLIC_API_URL || 'not set');
}

type Json = Record<string, unknown>;

export function useApi() {
  /* 현재 로그인 토큰 */
  const { accessToken } = useAuth();

  /* baseUrl은 한 번만 계산 */
  const [baseUrl] = useState(API_URL);

  /* 공통 헤더 생성기 */
  const hdr = useCallback(
    (extra: HeadersInit = {}) => ({
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...extra,
    }),
    [accessToken],
  );

  /* 폼 데이터용 헤더 (Content-Type 제외) */
  const formHdr = useCallback(
    () => ({
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [accessToken],
  );

  /* ---------------- HTTP 메서드 ---------------- */
  const get = useCallback(async <T = Json>(ep: string) => {
    const fullUrl = `${baseUrl}${ep}`;
    console.log(`🌐 GET ${fullUrl}`);
    console.log(`🌐 Base URL: ${baseUrl}`);
    console.log(`🌐 Endpoint: ${ep}`);
    
    try {
      const r = await fetch(fullUrl, { 
        headers: hdr()
      });
      
      console.log(`✅ Response status: ${r.status} ${r.statusText}`);
      
      if (!r.ok) {
        const errorText = await r.text();
        // 401 Unauthorized는 예상된 에러 (로그인하지 않은 상태)
        // 조용히 처리하되, 다른 에러는 로깅
        if (r.status === 401) {
          console.log(`ℹ️ 401 Unauthorized (expected if not logged in)`);
        } else {
          console.error(`❌ HTTP Error: ${r.status} - ${errorText}`);
        }
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      
      const result = await r.json();
      console.log(`✅ Response received:`, result);
      return result as T;
    } catch (error) {
      console.error(`❌ Network Error for ${fullUrl}:`, error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(`Network connection failed. Please check if ${baseUrl} is accessible.`);
      }
      throw error;
    }
  }, [baseUrl, hdr]);

  const post = useCallback(async <T = Json>(ep: string, data: unknown) => {
    console.log(`POST ${baseUrl}${ep}`);
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'POST',
      headers: hdr(),
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  const put = useCallback(async <T = Json>(ep: string, data: unknown) => {
    console.log(`PUT ${baseUrl}${ep}`);
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'PUT',
      headers: hdr(),
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  const del = useCallback(async <T = Json>(ep: string) => {
    console.log(`DELETE ${baseUrl}${ep}`);
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'DELETE',
      headers: hdr(),
    });
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  /** 파일 업로드 (FormData) */
  const postForm = useCallback(async <T = Json>(ep: string, form: FormData) => {
    console.log(`POST (FormData) ${baseUrl}${ep}`);
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'POST',
      headers: formHdr(), // Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
      body: form,
    });
    if (!r.ok) {
      const errorText = await r.text();
      console.error('FormData upload error:', errorText);
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return (await r.json()) as T;
  }, [baseUrl, formHdr]);

  /* 훅이 반환하는 메서드들 */
  return {
    baseUrl,
    get,
    post,
    put,
    del,
    postForm,
    api: { get, post, put, del, postForm },  // ← api 객체로 싸서 내보내기
  };
}
