import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { DateTime } from "luxon";
import { isWithinAvailability } from "../../lib/time";

type OkPost = { ok: true; appointmentId: string };
type OkGet = {
  ok: true;
  appointments: Array<{
    id: string;
    barberId: string;
    name: string;
    lastname: string;
    phone: string;
    persons: number;
    address: string;
    date: string;
  }>;
};
type Err = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OkPost | OkGet | Err>,
) {
  if (req.method === "GET") {
    const barberId = typeof req.query.barberId === "string" ? req.query.barberId : null;
    const where = barberId ? { barberId } : undefined;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: "asc" },
    });
    return res.status(200).json({
      ok: true,
      appointments: appointments.map((a) => ({
        id: a.id,
        barberId: a.barberId,
        name: a.name,
        lastname: a.lastname,
        phone: a.phone,
        persons: a.persons,
        address: a.address,
        date: a.date.toISOString(),
      })),
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
  }

  const body = (req.body ?? {}) as {
    name?: string;
    lastname?: string;
    phone?: string;
    persons?: number;
    address?: string;
    date?: string; // ISO (UTC)
    day?: string; // YYYY-MM-DD (barber timezone)
    time?: string; // HH:MM (barber timezone)
  };

  if (
    !body.name ||
    !body.lastname ||
    !body.phone ||
    !body.address ||
    typeof body.persons !== "number" ||
    !Number.isFinite(body.persons) ||
    body.persons < 1
  ) {
    return res.status(400).json({ ok: false, error: "Champs invalides" });
  }

  const barber = await prisma.barber.findFirst();
  if (!barber) {
    return res
      .status(400)
      .json({ ok: false, error: "Aucun coiffeur configuré" });
  }

  const timezone = barber.timezone || "Africa/Algiers";

  const appointmentUtc = body.day && body.time
    ? DateTime.fromISO(`${body.day}T${body.time}:00`, { zone: timezone }).toUTC()
    : DateTime.fromISO(body.date ?? "", { zone: "utc" });
  if (!appointmentUtc.isValid) {
    return res.status(400).json({ ok: false, error: "Date invalide" });
  }
  if (appointmentUtc.toJSDate().getTime() < Date.now()) {
    return res.status(400).json({ ok: false, error: "Date dans le passé" });
  }

  const appointmentInZone = appointmentUtc.setZone(timezone);
  if (!appointmentInZone.isValid) {
    return res
      .status(400)
      .json({ ok: false, error: "Fuseau horaire invalide" });
  }

  const durationHours = 2 * Math.floor(body.persons);
  const endUtc = appointmentUtc.plus({ hours: durationHours });
  const endInZone = endUtc.setZone(timezone);
  if (!endInZone.isValid) {
    return res.status(400).json({ ok: false, error: "Date de fin invalide" });
  }
  if (!appointmentInZone.hasSame(endInZone, "day")) {
    return res.status(400).json({
      ok: false,
      error: "Le rendez-vous ne doit pas dépasser le jour sélectionné",
    });
  }

  const weekday = appointmentInZone.weekday; // 1..7
  const avails = await prisma.availability.findMany({
    where: { barberId: barber.id, day: weekday },
  });
  if (!avails.length) {
    return res.status(400).json({
      ok: false,
      error: "Aucune disponibilité ce jour-là",
    });
  }

  const isOk = avails.some((a) =>
    isWithinAvailability({
      appointmentInZone,
      appointmentEndInZone: endInZone,
      startHour: a.startHour,
      endHour: a.endHour,
    }),
  );
  if (!isOk) {
    return res.status(400).json({
      ok: false,
      error: "Créneau hors horaires",
    });
  }

  const startDate = appointmentUtc.toJSDate();
  const endDate = endUtc.toJSDate();

  const existing = await prisma.appointment.findMany({
    where: {
      barberId: barber.id,
      date: {
        lt: endDate,
      },
    },
    orderBy: { date: "asc" },
    take: 200,
  });

  const overlaps = existing.some((a) => {
    const aStart = DateTime.fromJSDate(a.date, { zone: "utc" });
    const aEnd = aStart.plus({ hours: 2 * a.persons });
    return appointmentUtc < aEnd && endUtc > aStart;
  });

  if (overlaps) {
    return res.status(409).json({ ok: false, error: "Créneau déjà occupé" });
  }

  const created = await prisma.appointment.create({
    data: {
      barberId: barber.id,
      name: body.name.trim(),
      lastname: body.lastname.trim(),
      phone: body.phone.trim(),
      persons: Math.floor(body.persons),
      address: body.address.trim(),
      date: startDate,
    },
  });

  return res.status(201).json({ ok: true, appointmentId: created.id });
}

