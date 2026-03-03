import { randomBytes, createHash } from 'crypto';

export function generateResetToken() {
  return randomBytes(32).toString('hex');
}

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function passwordResetIdentifier(email: string) {
  return `password-reset:${email.toLowerCase()}`;
}
