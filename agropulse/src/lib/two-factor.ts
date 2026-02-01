import { generateSecret, generateURI, verifySync } from "otplib";
import * as QRCode from "qrcode";


export function generateTwoFactorSecret(): string {
  return generateSecret({ length: 20 });
}


export function generateTwoFactorUri(
  email: string,
  secret: string,
  issuer: string = "AgroPulse"
): string {
  return generateURI({
    issuer,
    label: email,
    secret,
    algorithm: "sha1",
    digits: 6,
    period: 30,
  });
}

/**
 * Generate a QR code data URL for the authenticator app
 */
export async function generateTwoFactorQRCode(
  email: string,
  secret: string
): Promise<string> {
  const uri = generateTwoFactorUri(email, secret);
  return QRCode.toDataURL(uri);
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token, secret });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Generate backup codes for recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Array.from({ length: 8 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
    codes.push(code);
  }
  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = await import("bcryptjs");
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}

/**
 * Verify a backup code against hashed codes
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; index: number }> {
  const bcrypt = await import("bcryptjs");
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]!);
    if (isValid) {
      return { valid: true, index: i };
    }
  }
  return { valid: false, index: -1 };
}
