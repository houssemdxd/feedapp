import { randomBytes, createHash } from "crypto";
export function generateToken(bytes = 32) { return randomBytes(bytes).toString("hex"); }
export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }