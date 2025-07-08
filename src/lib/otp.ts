import crypto from 'crypto';

/**
 * Generate a secure 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Validate OTP format (6 digits)
 */
export function validateOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Generate a secure hash for OTP storage
 */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify OTP against stored hash
 */
export function verifyOTP(otp: string, hashedOTP: string): boolean {
  const inputHash = hashOTP(otp);
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hashedOTP));
}

/**
 * Rate limiting configuration
 */
export const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 3,
} as const;

/**
 * Generate expiration timestamp
 */
export function generateExpiryTime(minutes: number = OTP_CONFIG.EXPIRY_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
} 