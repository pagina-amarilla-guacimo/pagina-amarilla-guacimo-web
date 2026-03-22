import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  adminId: number;
  email: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-auth-session-secret-change-me";
  }

  throw new Error("AUTH_SESSION_SECRET no esta configurado");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadB64: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function createAdminSessionToken(admin: { id: number; email: string }) {
  const payload: SessionPayload = {
    adminId: admin.id,
    email: admin.email.toLowerCase().trim(),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadB64);

  return `${payloadB64}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return { valid: false as const, reason: "missing" };
  }

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return { valid: false as const, reason: "invalid" };
  }

  const expectedSignature = sign(payloadB64);
  if (!safeCompare(signature, expectedSignature)) {
    return { valid: false as const, reason: "invalid" };
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(fromBase64Url(payloadB64)) as SessionPayload;
  } catch {
    return { valid: false as const, reason: "invalid" };
  }

  if (!payload.exp || Date.now() > payload.exp) {
    return { valid: false as const, reason: "expired" };
  }

  return { valid: true as const, payload };
}

export function getSessionMaxAgeSeconds() {
  return Math.floor(SESSION_TTL_MS / 1000);
}
