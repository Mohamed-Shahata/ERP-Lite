import { Transform } from 'class-transformer';

/** Strips HTML tags from free-text fields before they ever reach Prisma,
 * so stored values can never carry a stored-XSS payload. */
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

/** Property decorator: sanitizes optional/required free-text string fields
 * (descriptions, addresses, notes) on the way in. Use on any DTO field that
 * accepts user-authored text which might later be rendered in the UI. */
export function Sanitize() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? stripHtml(value) : value,
  );
}
