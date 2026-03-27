import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { prisma } from "../../../lib/prisma";
import { BARBER_COOKIE_NAME, signBarberSession } from "../../../lib/auth";

type Ok = { ok: true };
type Err = { ok: false; error: string };

function isBcryptHash(s: string) {
  return s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
  }

  const { email, password } = (req.body ?? {}) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Champs manquants" });
  }

  const barber = await prisma.barber.findUnique({ where: { email } });
  if (!barber) {
    return res.status(401).json({ ok: false, error: "Identifiants invalides" });
  }

  const ok = isBcryptHash(barber.password)
    ? await bcrypt.compare(password, barber.password)
    : password === barber.password;

  if (!ok) {
    return res.status(401).json({ ok: false, error: "Identifiants invalides" });
  }

  const token = signBarberSession({ barberId: barber.id, email: barber.email });
  res.setHeader(
    "Set-Cookie",
    serialize(BARBER_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }),
  );

  return res.status(200).json({ ok: true });
}

