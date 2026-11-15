import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { argon2id } from "@noble/hashes/argon2.js";

const ARGON2_PARAMS = {
  t: 2,
  m: 19_456,
  p: 1,
  dkLen: 32,
} as const;

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

function parseArgon2Hash(stored: string):
  | { salt: Buffer; hash: Buffer; params: { t: number; m: number; p: number } }
  | null {
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "argon2id" || parts[1] !== "v=19") return null;
  const [, , paramText, saltText, hashText] = parts;
  if (!paramText || !saltText || !hashText) return null;

  const params: Record<string, number> = {};
  for (const item of paramText.split(",")) {
    const [key, value] = item.split("=");
    if (!key || !value) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    params[key] = parsed;
  }
  if (!params.m || !params.t || !params.p) return null;

  try {
    return {
      salt: Buffer.from(saltText, "hex"),
      hash: Buffer.from(hashText, "hex"),
      params: { t: params.t, m: params.m, p: params.p },
    };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const derived = argon2id(password, salt, ARGON2_PARAMS);
  return `argon2id$v=19$m=${ARGON2_PARAMS.m},t=${ARGON2_PARAMS.t},p=${ARGON2_PARAMS.p}$${salt.toString(
    "hex",
  )}$${Buffer.from(derived).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (stored.startsWith("argon2id$")) {
      const parsed = parseArgon2Hash(stored);
      if (!parsed) return false;
      const actual = Buffer.from(
        argon2id(password, parsed.salt, {
          ...parsed.params,
          dkLen: parsed.hash.length,
        }),
      );
      if (actual.length !== parsed.hash.length) return false;
      return timingSafeEqual(actual, parsed.hash);
    }

    const [algorithm, salt, expected] = stored.split("$");
    if (algorithm !== "scrypt" || !salt || !expected) return false;
    const actual = scryptSync(password, salt, KEY_LENGTH);
    const expectedBuffer = Buffer.from(expected, "hex");
    if (actual.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actual, expectedBuffer);
  } catch {
    return false;
  }
}

export function needsPasswordRehash(stored: string): boolean {
  if (!stored.startsWith("argon2id$")) return true;
  const parsed = parseArgon2Hash(stored);
  if (!parsed) return true;
  return (
    parsed.params.t < ARGON2_PARAMS.t ||
    parsed.params.m < ARGON2_PARAMS.m ||
    parsed.params.p < ARGON2_PARAMS.p
  );
}
