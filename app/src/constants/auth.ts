import { AUTH0_OTP_DIGITS } from '@env';

export const AUTH_CONSTANTS = {
  OTP_LENGTH: parseInt(AUTH0_OTP_DIGITS || '6', 10),
} as const;