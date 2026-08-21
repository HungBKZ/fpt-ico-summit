/**
 * src/lib/auth/password.ts
 *
 * Password security utilities using native Node.js `node:crypto` APIs.
 * Zero third-party crypto dependencies.
 *
 * Hash Format: `scrypt$v1$<saltHex>$<derivedKeyHex>`
 */

import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;
const SALT_LEN = 16;
const HASH_VERSION = "v1";

/**
 * Normalizes email strings (trimmed and lowercased).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Hashes a plaintext password using Node scrypt with a unique random salt.
 * Returns versioned string representation: `scrypt$v1$<saltHex>$<derivedKeyHex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derivedKey = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `scrypt$${HASH_VERSION}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored versioned scrypt hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith("scrypt$")) {
    return false;
  }

  const parts = storedHash.split("$");
  if (parts.length !== 4) {
    return false;
  }

  const [, version, saltHex, derivedKeyHex] = parts;
  if (version !== HASH_VERSION || !saltHex || !derivedKeyHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(derivedKeyHex, "hex");

  try {
    const derivedKey = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
    if (derivedKey.length !== storedKey.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically random temporary password.
 * Displayed ONCE to Admin upon account creation and NEVER saved in plaintext.
 */
export function generateTemporaryPassword(length = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

/**
 * Validates password policy for user-selected passwords.
 * Rules: min 12 characters, max 128 characters.
 */
export function validateUserPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || password.length < 12) {
    return {
      valid: false,
      message: "Password must be at least 12 characters long.",
    };
  }
  if (password.length > 128) {
    return {
      valid: false,
      message: "Password exceeds maximum allowed length of 128 characters.",
    };
  }
  return { valid: true };
}
