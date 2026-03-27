import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { getBarberSessionFromApiRequest } from "../../lib/auth";
import { parseTimeToMinutes } from "../../lib/time";

type AvailabilityDto = {
  id: string;
  day: number;
  startHour: string;
  endHour: string;
};

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };

function toDto(a: { id: string; day: number; startHour: string; endHour: string }): AvailabilityDto {
  return { id: a.id, day: a.day, startHour: a.startHour, endHour: a.endHour };
}

function validateAvailabilityInput(input: {
  day?: unknown;
  startHour?: unknown;
  endHour?: unknown;
}): { ok: true; day: number; startHour: string; endHour: string } | { ok: false; error: string } {
  const day = Number(input.day);
  const startHour = String(input.startHour ?? "");
  const endHour = String(input.endHour ?? "");

  if (!Number.isInteger(day) || day < 1 || day > 7) {
    return { ok: false, error: "Jour invalide (1..7)" };
  }
  const s = parseTimeToMinutes(startHour);
  const e = parseTimeToMinutes(endHour);
  if (s === null || e === null) {
    return { ok: false, error: "Heure invalide (HH:MM)" };
  }
  if (e <= s) {
    return { ok: false, error: "L’heure de fin doit être après le début" };
  }
  return { ok: true, day, startHour, endHour };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok<AvailabilityDto[] | AvailabilityDto | true> | Err>,
) {
  const session = getBarberSessionFromApiRequest(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: "Non authentifié" });
  }

  if (req.method === "GET") {
    const list = await prisma.availability.findMany({
      where: { barberId: session.barberId },
      orderBy: [{ day: "asc" }, { startHour: "asc" }],
    });
    return res.status(200).json({ ok: true, data: list.map(toDto) });
  }

  if (req.method === "POST") {
    const v = validateAvailabilityInput(req.body ?? {});
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const created = await prisma.availability.create({
      data: {
        barberId: session.barberId,
        day: v.day,
        startHour: v.startHour,
        endHour: v.endHour,
      },
    });
    return res.status(201).json({ ok: true, data: toDto(created) });
  }

  if (req.method === "PUT") {
    const { id, day, startHour, endHour } = (req.body ?? {}) as Partial<AvailabilityDto>;
    if (!id) return res.status(400).json({ ok: false, error: "ID manquant" });
    const v = validateAvailabilityInput({ day, startHour, endHour });
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const existing = await prisma.availability.findUnique({ where: { id } });
    if (!existing || existing.barberId !== session.barberId) {
      return res.status(404).json({ ok: false, error: "Introuvable" });
    }

    const updated = await prisma.availability.update({
      where: { id },
      data: { day: v.day, startHour: v.startHour, endHour: v.endHour },
    });
    return res.status(200).json({ ok: true, data: toDto(updated) });
  }

  if (req.method === "DELETE") {
    const { id } = (req.body ?? {}) as { id?: string };
    if (!id) return res.status(400).json({ ok: false, error: "ID manquant" });

    const existing = await prisma.availability.findUnique({ where: { id } });
    if (!existing || existing.barberId !== session.barberId) {
      return res.status(404).json({ ok: false, error: "Introuvable" });
    }

    await prisma.availability.delete({ where: { id } });
    return res.status(200).json({ ok: true, data: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
}

