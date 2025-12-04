import { create } from 'zustand';
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

interface AuthState {
  user: Auth0User | null;
  accessToken: string | null;
  ready: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

/* ---------- env ---------- */
const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? '';
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? '';
const AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE ?? '';

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
const USER_KEY = 'lostlink_user';

/* ---------- Zustand store ---------- */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  ready: false,

  /* ① 초기화 - 세션 복원 + URL에서 토큰 파싱 (Safari 대응) */
  initialize: async () => {
    try {
      // 웹에서 URL에 access_token이 있는지 확인 (Auth0 리다이렉트)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          // URL에서 토큰 파싱 성공
          const discovery = {
            userInfoEndpoint: `https://${AUTH0_DOMAIN}/userinfo`,
          };
          
          try {
            const uResp = await fetch(discovery.userInfoEndpoint, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const uInfo = (await uResp.json()) as Auth0User;
            
            set({ accessToken, user: uInfo });
            await Storage.set(TOKEN_KEY, accessToken);
            await Storage.set(USER_KEY, JSON.stringify(uInfo));
            
            // URL에서 토큰 제거 (보안)
            window.history.replaceState(null, '', window.location.pathname);
            
            return;
          } catch (err) {
            console.error('Failed to fetch user info from token:', err);
          }
        }
      }
      
      // 저장된 토큰 확인
      const t = await Storage.get(TOKEN_KEY);
      const u = await Storage.get(USER_KEY);
      if (t && u) {
        set({ accessToken: t, user: JSON.parse(u) });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      set({ ready: true });
    }
  },

  /* ② 로그인 */
  login: async () => {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
      console.warn('Auth0 환경변수 누락');
      return;
    }

    const redirectUri =
      Platform.OS === 'web'
        ? `${window.location.origin}`
        : AuthSession.makeRedirectUri();

    console.log('[Auth0 Domain]', AUTH0_DOMAIN);
    console.log('[Auth0 Client ID]', AUTH0_CLIENT_ID);
    console.log('[Platform]', Platform.OS);
    console.log('[Redirect URI]', redirectUri);

    const discovery = {
      authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
      tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
      userInfoEndpoint: `https://${AUTH0_DOMAIN}/userinfo`,
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

    // 웹에서는 직접 리다이렉트 (Safari 호환)
    if (Platform.OS === 'web') {
      const authUrl = `${discovery.authorizationEndpoint}?` +
        `client_id=${AUTH0_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=openid profile email&` +
        (AUDIENCE ? `audience=${encodeURIComponent(AUDIENCE)}&` : '') +
        `state=${Date.now()}`;
      
      // Safari에서도 작동하도록 window.location으로 리다이렉트
      window.location.href = authUrl;
      return; // 리다이렉트 후 initialize에서 토큰 처리
    }

    // 모바일은 기존 방식
    const res = await req.promptAsync({
      useProxy: true,
    } as any);

    if (res.type !== 'success' || !res.params?.access_token) {
      console.warn('로그인 실패/취소', res);
      return;
    }

    const token = res.params.access_token;
    const uResp = await fetch(discovery.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const uInfo = (await uResp.json()) as Auth0User;

    set({ accessToken: token, user: uInfo });
    await Storage.set(TOKEN_KEY, token);
    await Storage.set(USER_KEY, JSON.stringify(uInfo));
  },

  /* ③ 로그아웃 */
  logout: async () => {
    set({ accessToken: null, user: null });
    await Storage.del(TOKEN_KEY);
    await Storage.del(USER_KEY);
  },
}));

