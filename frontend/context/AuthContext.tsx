import * as React from 'react';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface Auth0User {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: Auth0User | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lostlink_token';
const USER_KEY = 'lostlink_user';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Auth0User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  // Read Auth0 config from app.config extras
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    AUTH0_DOMAIN?: string;
    AUTH0_CLIENT_ID?: string;
  };
  const { AUTH0_DOMAIN = '', AUTH0_CLIENT_ID = '' } = extra;
  function getItem(key: any) {

  if (Platform.OS === 'web') {
    return Promise.resolve(localStorage.getItem(key));
  }
  return SecureStore.getItemAsync(key);
}

function setItem(key:any, value:any) {
  if (Platform.OS === 'web') {
    return localStorage.setItem(key,value);
  }
  return SecureStore.setItemAsync(key, value);
}
function deleteItem(key:any) {
  if (Platform.OS === 'web') {
    return localStorage.removeItem(key);
  }
  return SecureStore.deleteItemAsync(key);
}

  React.useEffect(() => {
    (async () => {
      try {
        const storedToken = await getItem(TOKEN_KEY);
        const storedUser = await getItem(USER_KEY);
        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn('Failed to restore auth session', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function login() {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
      console.warn('Auth0 configuration missing');
      return;
    }

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true } as any);

    const discovery: AuthSession.DiscoveryDocument = {
      authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
      tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
      userInfoEndpoint: `https://${AUTH0_DOMAIN}/userinfo`,
    };

    const requestConfig: AuthSession.AuthRequestConfig = {
      clientId: AUTH0_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    };

    try {
      const authRequest = await AuthSession.loadAsync(requestConfig, discovery);
      const result = await authRequest.promptAsync(discovery, { useProxy: true } as any);

      if (result.type === 'success' && result.params?.access_token) {
        const token = result.params.access_token;
        const userResp = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userInfo: Auth0User = await userResp.json();

        setAccessToken(token);
        setUser(userInfo);
        await setItem(TOKEN_KEY, token);
        await setItem(USER_KEY, JSON.stringify(userInfo));
      }
    } catch (err) {
      console.error('Auth0 login failed', err);
    }
  }

  async function logout() {
    setUser(null);
    setAccessToken(null);
    await deleteItem(TOKEN_KEY);
    await deleteItem(USER_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth }; 