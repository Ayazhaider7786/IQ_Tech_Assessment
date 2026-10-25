import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(duration);

export function formatDateShort(value: string | Date): string {
  return dayjs.utc(value).local().format('D MMM YYYY');
}

export function formatDateTime(value: string | Date): string {
  return dayjs.utc(value).local().format('D MMM YYYY, HH:mm');
}

export function formatRelative(value: string | Date): string {
  return dayjs.utc(value).local().fromNow();
}

export { dayjs };
