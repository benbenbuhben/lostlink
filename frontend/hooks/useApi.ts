import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const RAW_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5001';
const API_URL = RAW_URL.replace(/\/+$/, ''); // 뒷슬래시 제거

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
    console.log(`GET ${baseUrl}${ep}`);
    const r = await fetch(`${baseUrl}${ep}`, { headers: hdr() });
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return (await r.json()) as T;
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
