function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractAccountIdFromToken(token: string | null): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Backend JWT is issued with claim "accountId" in UserService/AuthServiceImpl.
  const accountId = toPositiveNumber(payload.accountId);
  if (accountId) return accountId;

  return toPositiveNumber(payload.accountID);
}
