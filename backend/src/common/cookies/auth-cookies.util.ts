import { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Both cookies are httpOnly: JavaScript in the browser can never read or
 * write them (no more `document.cookie = 'role=ADMIN'` spoofing).
 * `secure` is only enforced in production so local http dev still works.
 */
export function setAccessTokenCookie(
  res: Response,
  token: string,
  maxAgeMs: number,
) {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  });
}

/**
 * Scoped to /auth so the refresh token is never sent on ordinary API calls —
 * it only travels on requests to /auth/refresh and /auth/logout.
 */
export function setRefreshTokenCookie(
  res: Response,
  token: string,
  maxAgeMs: number,
) {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/auth',
    maxAge: maxAgeMs,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
}
