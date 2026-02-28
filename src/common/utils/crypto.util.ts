// src/common/utils/crypto.util.ts
import * as bcrypt from 'bcrypt';

export async function hashValue(value: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(value, salt);
}

export async function compareHash(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
