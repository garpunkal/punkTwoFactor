import * as crypto from 'crypto';

/**
 * Decodes a Base32 encoded string (RFC 4648) into a Buffer.
 */
export function base32Decode(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/[\s=-]/g, '');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const char = cleanBase32.charAt(i);
    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a 6-digit TOTP code (RFC 6238) for a given Base32 secret at the current time.
 * @param secret Base32 encoded TOTP secret
 * @param timeOffsetSeconds Optional offset in seconds (e.g., -30, 0, 30)
 * @returns 6-digit TOTP string with leading zeros
 */
export function generateTotpCode(secret: string, timeOffsetSeconds = 0): string {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000) + timeOffsetSeconds;
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const code = (binary % 1_000_000).toString().padStart(6, '0');
  return code;
}

/**
 * Extracts the secret parameter from an otpauth://totp/ URI.
 */
export function extractSecretFromOtpAuthUri(uri: string): string | null {
  try {
    const parsed = new URL(uri);
    return parsed.searchParams.get('secret');
  } catch {
    const match = uri.match(/[?&]secret=([A-Za-z2-7]+)/i);
    return match ? match[1] : null;
  }
}
