const DAYS_AGO_REGEX = /\{(\d+) days ago\}/i;
const DAYS_FROM_NOW_REGEX = /\{(\d+) days from now\}/i;
const MY_ACCOUNT_PLACEHOLDER = '{my account}';
const DATE_FORMAT_MS_PADDING = 3;

export interface RqlQueryProcessResult {
  valid: boolean;
  query: string;
}

const toUtcMidnight = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const toDayAfterInit = (date: Date): Date => {
  const midnight = toUtcMidnight(date);
  midnight.setUTCDate(midnight.getUTCDate() + 1);
  return midnight;
};

const formatUtcDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const ms = String(date.getUTCMilliseconds()).padStart(DATE_FORMAT_MS_PADDING, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
};

export const processRqlQuery = (
  query: string,
  accountId?: string,
  now: Date = new Date(),
): RqlQueryProcessResult => {
  if (!query || !query.trim()) {
    return { valid: false, query };
  }

  let processed = query;

  if (processed.toLowerCase().includes(MY_ACCOUNT_PLACEHOLDER.toLowerCase())) {
    if (!accountId) {
      return { valid: false, query };
    }
    processed = processed.replace(new RegExp(MY_ACCOUNT_PLACEHOLDER, 'gi'), accountId);
  }

  const daysAgoMatch = DAYS_AGO_REGEX.exec(processed);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    const target = toUtcMidnight(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));
    processed = processed.replace(daysAgoMatch[0], formatUtcDate(target));
  }

  const daysFromNowMatch = DAYS_FROM_NOW_REGEX.exec(processed);
  if (daysFromNowMatch) {
    const days = parseInt(daysFromNowMatch[1], 10);
    const target = toDayAfterInit(new Date(now.getTime() + days * 24 * 60 * 60 * 1000));
    processed = processed.replace(daysFromNowMatch[0], formatUtcDate(target));
  }

  return { valid: true, query: processed };
};
