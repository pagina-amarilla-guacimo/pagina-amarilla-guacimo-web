import crypto from "crypto";

type ResetTokenPayload = {
  email: string;
  codeHash: string;
  exp: number;
};

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

function getResetSecret() {
  const secret = process.env.PASSWORD_RESET_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-password-reset-secret-change-me";
  }

  throw new Error("PASSWORD_RESET_SECRET no esta configurado");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function sign(payloadB64: string) {
  return crypto
    .createHmac("sha256", getResetSecret())
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

export function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createPasswordResetToken(email: string, code: string) {
  const expiresAt = Date.now() + RESET_CODE_TTL_MS;
  const payload: ResetTokenPayload = {
    email: email.toLowerCase().trim(),
    codeHash: hashCode(code),
    exp: expiresAt,
  };

  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadB64);

  return {
    token: `${payloadB64}.${signature}`,
    expiresAt,
  };
}

export function verifyPasswordResetToken(params: {
  token: string;
  email: string;
  code: string;
}) {
  const [payloadB64, signature] = params.token.split(".");
  if (!payloadB64 || !signature) {
    return { valid: false, reason: "Token invalido" };
  }

  const expectedSignature = sign(payloadB64);
  if (!safeCompare(signature, expectedSignature)) {
    return { valid: false, reason: "Token invalido" };
  }

  let payload: ResetTokenPayload;
  try {
    payload = JSON.parse(fromBase64Url(payloadB64)) as ResetTokenPayload;
  } catch {
    return { valid: false, reason: "Token invalido" };
  }

  if (!payload.exp || Date.now() > payload.exp) {
    return { valid: false, reason: "Codigo expirado" };
  }

  if (payload.email !== params.email.toLowerCase().trim()) {
    return { valid: false, reason: "Token invalido" };
  }

  const inputCodeHash = hashCode(params.code.trim());
  if (!safeCompare(payload.codeHash, inputCodeHash)) {
    return { valid: false, reason: "Codigo incorrecto" };
  }

  return { valid: true, expiresAt: payload.exp };
}
