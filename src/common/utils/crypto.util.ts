import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';

export class CryptoUtil {
  static async hashPassword(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  static async comparePassword(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }

  static generatePlainToken(size = 32): string {
    return randomBytes(size).toString('hex');
  }

  static sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}