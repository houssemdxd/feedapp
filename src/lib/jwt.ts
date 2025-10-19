// import { SignJWT, jwtVerify } from "jose";
// const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secretkey");
// const alg = "HS256";

// export async function signAccessToken(payload: { userId: string }) {
//   return await new SignJWT(payload)
//     .setProtectedHeader({ alg })
//     .setIssuedAt()
//     .setExpirationTime("2h")
//     .sign(secret);
// }
// export async function verifyAccessToken<T extends object = any>(token: string): Promise<(T & { userId: string }) | null> {
//   try {
//     const { payload } = await jwtVerify(token, secret);
//     if (!payload || typeof payload.userId !== "string") return null;
//     return payload as T & { userId: string };
//   } catch {
//     return null;
//   }
// }

import jwt from "jsonwebtoken";

const ACCESS_EXPIRES = "2h"; // keep short; bump if you need

export function signAccessToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken<T = any>(token: string): T {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as T;
}
