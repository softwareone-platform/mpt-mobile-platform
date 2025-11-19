import { AUTH_CONSTANTS } from '@/constants';

export const validateOTP = (code: string, expectedLength?: number): boolean => {
  const length = expectedLength ?? AUTH_CONSTANTS.OTP_LENGTH;
  const digitRegex = new RegExp(`^\\d{${length}}$`);
  return code.length === length && digitRegex.test(code);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};