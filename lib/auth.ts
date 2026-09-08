import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import bcrypt from "bcryptjs";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "change_this_jwt_secret";

export function signToken(payload: object, expiresIn: StringValue | number = "7d") {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
