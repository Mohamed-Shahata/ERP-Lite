export function decodeJwtRole(token: string | undefined): string | null {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const json = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}
