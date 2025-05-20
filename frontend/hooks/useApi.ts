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

  /* ---------------- HTTP 메서드 ---------------- */
  const get = useCallback(async <T = Json>(ep: string) => {
    const r = await fetch(`${baseUrl}${ep}`, { headers: hdr() });
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  const post = useCallback(async <T = Json>(ep: string, data: unknown) => {
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'POST',
      headers: hdr(),
      body: JSON.stringify(data),
    });
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  const put = useCallback(async <T = Json>(ep: string, data: unknown) => {
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'PUT',
      headers: hdr(),
      body: JSON.stringify(data),
    });
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  const del = useCallback(async <T = Json>(ep: string) => {
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'DELETE',
      headers: hdr(),
    });
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

  /** 파일 업로드 (FormData) */
  const postForm = useCallback(async <T = Json>(ep: string, form: FormData) => {
    const r = await fetch(`${baseUrl}${ep}`, {
      method: 'POST',
      headers: hdr({}),          // JSON 헤더 제거
      body: form,
    });
    return (await r.json()) as T;
  }, [baseUrl, hdr]);

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
