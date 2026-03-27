import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextApiRequest } from "next";

const COOKIE_NAME = "barber_session";

function getJwtSecret() {
  return process.env.JWT_SECRET ?? "dev-secret-change-me";
}

export type BarberSession = {
  barberId: string;
  email: string;
};

export function signBarberSession(payload: BarberSession) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function readTokenFromRequest(req: NextApiRequest): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
}

export function verifyBarberSession(token: string): BarberSession | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload | string;
    if (typeof decoded === "string") return null;
    const payload = decoded as JwtPayload & {
      barberId?: unknown;
      email?: unknown;
    };
    const barberId = payload.barberId;
    const email = payload.email;
    if (typeof barberId !== "string" || typeof email !== "string") return null;
    return { barberId, email };
  } catch {
    return null;
  }
}

export function getBarberSessionFromApiRequest(
  req: NextApiRequest,
): BarberSession | null {
  const token = readTokenFromRequest(req);
  if (!token) return null;
  return verifyBarberSession(token);
}

export const BARBER_COOKIE_NAME = COOKIE_NAME;

