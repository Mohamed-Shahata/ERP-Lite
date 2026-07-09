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
 * path: '/' (not scoped to /auth) so the Next.js middleware can see this
 * cookie on ordinary page navigations (e.g. /dashboard) and let the request
 * through while the access token is refreshed client-side. It's httpOnly
 * either way, so this doesn't expose it to JS — it just widens which
 * requests carry it.
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
    path: '/',
    maxAge: maxAgeMs,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });

  // Defensive: an earlier version of this code scoped the refresh cookie to
  // path '/auth'. Browsers key cookies by (name, domain, path), so clients
  // that logged in before the path was widened to '/' may still be carrying
  // a stale '/auth'-scoped refresh_token alongside the current one. Clearing
  // it here too purges that leftover instead of leaving it to shadow/collide
  // with the real cookie on every /auth/* request.
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
}
