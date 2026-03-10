import { EMPTY_STRING } from '@/constants/common';

const DEFAULT_DECIMAL_SPACES = 2;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

export const FUTURE = 1 as const;
export const PAST = -1 as const;
const FUTURE_ADJUSTMENT = 1;
const PAST_ADJUSTMENT = 0;

type RelativeDirection = typeof FUTURE | typeof PAST;

type DateParts = {
  hour?: string;
  minute?: string;
  weekday?: string;
  day?: string;
  month?: string;
  year?: string;
};

export const formatPhoneNumber = (prefix?: string, number?: string): string => {
  const parts = [prefix?.trim(), number?.trim()].filter(Boolean);

  return parts.join(' ');
};

export const formatPercentage = (
  numberToFormat?: number,
  decimals: number = DEFAULT_DECIMAL_SPACES,
): string => {
  if (numberToFormat === undefined || !numberToFormat) {
    return EMPTY_STRING;
  }

  return numberToFormat.toFixed(decimals) + '%';
};

export const numberFormatter = (fractionDigits: number, language: string) =>
  new Intl.NumberFormat(language || 'en-GB', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export const formatNumber = (
  numberToFormat: number | undefined,
  fractionDigits: number,
  language: string,
): string => {
  if (!numberToFormat || Number.isNaN(numberToFormat)) {
    return EMPTY_STRING;
  }

  const formattedNumber = numberFormatter(fractionDigits, language).format(numberToFormat);

  return formattedNumber;
};

export const getDatePartsForLocale = (
  isoDate: string | undefined,
  locale: string,
): DateParts | null => {
  if (!isoDate) {
    return null;
  }
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const dateParts = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);

  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).formatToParts(date);

  return {
    hour: timeParts.find((p) => p.type === 'hour')?.value,
    minute: timeParts.find((p) => p.type === 'minute')?.value,
    weekday: dateParts.find((p) => p.type === 'weekday')?.value,
    day: dateParts.find((p) => p.type === 'day')?.value,
    month: dateParts.find((p) => p.type === 'month')?.value,
    year: dateParts.find((p) => p.type === 'year')?.value,
  };
};

export const formatDateForLocale = (isoDate: string | undefined, locale: string) => {
  const parts = getDatePartsForLocale(isoDate, locale);

  if (!parts) {
    return EMPTY_STRING;
  }

  const { day, month, year } = parts;

  if (!day || !month || !year) return EMPTY_STRING;

  return `${day} ${month} ${year}`;
};

export function getTime(isoDate: string): string {
  if (!isoDate) {
    return EMPTY_STRING;
  }
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_STRING;
  }

  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export const getUtcStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const formatUtcDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * function to calculate date realtive to base date, in direction of past or future
 * @param days - number of days relative to base date
 * @param baseDate - date as a base date to calculate relative date
 * @param direction - either future or past
 * @returns date relative to base date in number of days into past or future
 */
export const calculateRelativeDate = (
  days: string,
  baseDate: Date,
  direction: RelativeDirection,
): string => {
  const parsedDays = parseInt(days, 10);

  if (isNaN(parsedDays)) {
    return '';
  }

  const baseOffset = parsedDays * direction;

  // add one day for the future and zero for the past
  const boundaryAdjustment = direction === FUTURE ? FUTURE_ADJUSTMENT : PAST_ADJUSTMENT;

  const totalOffset = baseOffset + boundaryAdjustment;

  const shifted = new Date(baseDate.getTime() + totalOffset * MS_PER_DAY);
  const utcStartOfDay = getUtcStartOfDay(shifted);

  return formatUtcDate(utcStartOfDay);
};

/**
 * function to format date for chat
 * @param isoDate - date string in ISO format
 * @param locale - locale used to translate values like month title
 * @returns date as string formatted according to how long in the past the date is
 * possible formats HH:MM, Weekday, DD Mon, DD Mon YYYY
 */
export const formatDateForChat = (isoDate: string | undefined, locale: string): string => {
  if (!isoDate) return EMPTY_STRING;

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_STRING;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const parts = getDatePartsForLocale(isoDate, locale);

  if (!parts) {
    return EMPTY_STRING;
  }

  const { hour, minute, weekday, day, month, year } = parts;

  if (!hour || !minute || !weekday || !day || !month || !year) {
    return EMPTY_STRING;
  }

  // within last 24 hours - HH:MM
  if (diffMs < MS_PER_DAY) {
    return `${hour}:${minute}`;
  }

  // within last 7 days - Weekday
  if (diffMs < DAYS_PER_WEEK * MS_PER_DAY) {
    return weekday || EMPTY_STRING;
  }

  // within current year - DD Mon
  if (date.getUTCFullYear() === now.getUTCFullYear()) {
    return `${day} ${month}`;
  }

  // older than current year - DD Mon YYYY
  return `${day} ${month} ${year}`;
};
