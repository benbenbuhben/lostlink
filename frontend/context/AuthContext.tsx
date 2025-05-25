// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

/* ---------- types ---------- */
interface Auth0User {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  [k: string]: any;
}
interface AuthContextType {
  user: Auth0User | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}

/* ---------- env ---------- */
const AUTH0_DOMAIN    = process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? '';
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? '';
const AUDIENCE        = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE ?? '';

/* ---------- storage helper (웹 ↔ 모바일) ---------- */
const Storage = {
  get: (k: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(k))
      : SecureStore.getItemAsync(k),
  set: (k: string, v: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(k, v))
      : SecureStore.setItemAsync(k, v),
  del: (k: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(k))
      : SecureStore.deleteItemAsync(k),
};

/* ---------- constants ---------- */
const TOKEN_KEY = 'lostlink_token';
const USER_KEY  = 'lostlink_user';

/* ---------- context ---------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<Auth0User | null>(null);
  const [accessToken, setTok] = useState<string | null>(null);
  const [ready, setReady]     = useState(false);

  /* ① 세션 복원 */
  useEffect(() => {
    (async () => {
      try {
        const t = await Storage.get(TOKEN_KEY);
        const u = await Storage.get(USER_KEY);
        if (t && u) {
          setTok(t);
          setUser(JSON.parse(u));
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  /* ② 로그인 */
  const login = async () => {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
      console.warn('Auth0 환경변수 누락');
      return;
    }

    const redirectUri =
      Platform.OS === 'web'
        ? `${window.location.origin}`  // /callback 제거하고 루트 URL 사용
        : AuthSession.makeRedirectUri();
        
    console.log('[Auth0 Domain]', AUTH0_DOMAIN);
    console.log('[Auth0 Client ID]', AUTH0_CLIENT_ID);
    console.log('[Platform]', Platform.OS);
    console.log('[Redirect URI]', redirectUri);
    console.log('[Current URL]', Platform.OS === 'web' ? window.location.href : 'N/A');

    const discovery = {
      authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
      tokenEndpoint:         `https://${AUTH0_DOMAIN}/oauth/token`,
      userInfoEndpoint:      `https://${AUTH0_DOMAIN}/userinfo`,
    };

    const req = await AuthSession.loadAsync(
      {
        clientId: AUTH0_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        extraParams: AUDIENCE ? { audience: AUDIENCE } : undefined,
      },
      discovery
    );

    console.log('[Auth Request]', req);

    const res = await req.promptAsync({
      useProxy: Platform.OS !== 'web',
    } as any);

    console.log('[Auth Response]', res);

    if (res.type !== 'success' || !res.params?.access_token) {
      console.warn('로그인 실패/취소', res);
      return;
    }

    const token = res.params.access_token;
    const uResp = await fetch(discovery.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const uInfo = (await uResp.json()) as Auth0User;

    console.log('[User Info]', uInfo);

    setTok(token);
    setUser(uInfo);
    await Storage.set(TOKEN_KEY, token);
    await Storage.set(USER_KEY, JSON.stringify(uInfo));
  };

  /* ③ 로그아웃 */
  const logout = async () => {
    setTok(null);
    setUser(null);
    await Storage.del(TOKEN_KEY);
    await Storage.del(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken: accessToken, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
