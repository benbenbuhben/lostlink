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

  /* ① 초기화 - 세션 복원 */
  initialize: async () => {
    try {
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

    const res = await req.promptAsync({
      useProxy: Platform.OS !== 'web',
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

