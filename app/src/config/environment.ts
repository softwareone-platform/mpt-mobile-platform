export const config = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || '',
  AUTH0_SCOPE: process.env.AUTH0_SCOPE || 'openid profile email offline_access',
  AUTH0_OTP_DIGITS: parseInt(process.env.AUTH0_OTP_DIGITS || '6', 10),
  AUTH0_SCHEME: process.env.AUTH0_SCHEME || '',
} as const;

export default config;