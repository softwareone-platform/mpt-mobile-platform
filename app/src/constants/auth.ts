import { configService } from '@/config/env.config';

const getValidOTPLength = (envValue?: string): number => {
  const defaultLength = 6;

  if (!envValue) {
    return defaultLength;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed) || parsed < 4 || parsed > 10) {
    console.warn(
      `Invalid AUTH0_OTP_DIGITS value: "${envValue}". Using default length: ${defaultLength}`,
    );
    return defaultLength;
  }

  return parsed;
};

export const AUTH_CONSTANTS = {
  OTP_LENGTH: getValidOTPLength(configService.get('AUTH0_OTP_DIGITS')),
} as const;
