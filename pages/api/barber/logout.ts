import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { BARBER_COOKIE_NAME } from "../../../lib/auth";

type Ok = { ok: true };
type Err = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
  }

  res.setHeader(
    "Set-Cookie",
    serialize(BARBER_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    }),
  );

  return res.status(200).json({ ok: true });
}

