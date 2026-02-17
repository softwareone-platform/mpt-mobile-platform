import {
  REVIEWER_EMAILS as REVIEWER_EMAILS_ENV,
  REVIEW_ENV_AUTH0_DOMAIN,
  REVIEW_ENV_AUTH0_CLIENT_ID,
  REVIEW_ENV_AUTH0_AUDIENCE,
  REVIEW_ENV_AUTH0_API_URL,
} from '@env';

function getReviewerEmails(): string[] {
  if (!REVIEWER_EMAILS_ENV || REVIEWER_EMAILS_ENV.trim() === '') {
    return [];
  }
  return REVIEWER_EMAILS_ENV.split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

export const REVIEWER_EMAILS = getReviewerEmails();

export const REVIEW_ENVIRONMENT = {
  AUTH0_DOMAIN: REVIEW_ENV_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: REVIEW_ENV_AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE: REVIEW_ENV_AUTH0_AUDIENCE,
  AUTH0_API_URL: REVIEW_ENV_AUTH0_API_URL,
} as const;

export function isReviewerEmail(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  return REVIEWER_EMAILS.some((reviewerEmail) => reviewerEmail.toLowerCase() === normalizedEmail);
}
