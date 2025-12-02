import 'dotenv/config';

export default ({ config }) => {
  console.log('Auth0 config:', {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  });
  
  return {
    ...config,
    extra: {
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
      AUTH0_REDIRECT_URI: process.env.AUTH0_REDIRECT_URI,
      expoClientId: '...',
    },
  };
}; 