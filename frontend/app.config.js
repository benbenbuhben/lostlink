import 'dotenv/config';

export default ({ config }) => {
  const authConfig = {
    AUTH0_DOMAIN: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || 'dev-p3dnd83yc74l2dvq.us.auth0.com',
    AUTH0_CLIENT_ID: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '7FtcCUBeLCbe7um6CwhVKC5Afo6u2eIc',
    AUTH0_REDIRECT_URI: process.env.EXPO_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:8081',
  };
  
  console.log('Auth0 config:', authConfig);
  
  return {
    ...config,
    extra: {
      ...authConfig,
      expoClientId: '...',
    },
  };
}; 