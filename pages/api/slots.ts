import type { NextApiRequest, NextApiResponse } from "next";
import { DateTime } from "luxon";
import { prisma } from "../../lib/prisma";
import { parseTimeToMinutes } from "../../lib/time";

type Ok = {
  ok: true;
  timezone: string;
  slots: string[]; // "HH:MM"
};
type Err = { ok: false; error: string };

function minutesToHHMM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
  }

  const dateStr = typeof req.query.date === "string" ? req.query.date : "";
  const persons = Number(
    typeof req.query.persons === "string" ? req.query.persons : "1",
  );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ ok: false, error: "Date invalide" });
  }
  if (!Number.isFinite(persons) || persons < 1 || persons > 10) {
    return res.status(400).json({ ok: false, error: "Persons invalide" });
  }

  const barber = await prisma.barber.findFirst();
  if (!barber) {
    return res
      .status(400)
      .json({ ok: false, error: "Aucun coiffeur configuré" });
  }

  const timezone = barber.timezone || "Africa/Algiers";
  const dayStart = DateTime.fromISO(`${dateStr}T00:00:00`, { zone: timezone });
  if (!dayStart.isValid) {
    return res.status(400).json({ ok: false, error: "Date invalide" });
  }
  const dayEnd = dayStart.plus({ days: 1 });

  // Fetch availabilities for this weekday (1..7)
  const weekday = dayStart.weekday;
  const avails = await prisma.availability.findMany({
    where: { barberId: barber.id, day: weekday },
    orderBy: { startHour: "asc" },
  });
  if (!avails.length) {
    return res.status(200).json({ ok: true, timezone, slots: [] });
  }

  // Fetch appointments overlapping this day (in UTC range)
  const existing = await prisma.appointment.findMany({
    where: {
      barberId: barber.id,
      date: {
        gte: dayStart.toUTC().toJSDate(),
        lt: dayEnd.toUTC().toJSDate(),
      },
    },
    orderBy: { date: "asc" },
    take: 500,
  });

  const durationMinutes = 120 * Math.floor(persons);
  const stepMinutes = 120;

  const slots: string[] = [];

  // For each availability window, generate HH:MM every 2h
  for (const a of avails) {
    const startMin = parseTimeToMinutes(a.startHour);
    const endMin = parseTimeToMinutes(a.endHour);
    if (startMin === null || endMin === null) continue;
    if (endMin <= startMin) continue;

    for (let m = startMin; m + durationMinutes <= endMin; m += stepMinutes) {
      const startInZone = dayStart.plus({ minutes: m });
      const endInZone = startInZone.plus({ minutes: durationMinutes });

      // reject past slots (now in zone)
      if (startInZone.toMillis() < DateTime.now().setZone(timezone).toMillis()) {
        continue;
      }

      // safety: must stay within day
      if (!startInZone.hasSame(endInZone, "day")) continue;

      const startUtc = startInZone.toUTC();
      const endUtc = endInZone.toUTC();

      const overlaps = existing.some((appt) => {
        const apptStartUtc = DateTime.fromJSDate(appt.date, { zone: "utc" });
        const apptEndUtc = apptStartUtc.plus({ minutes: 120 * appt.persons });
        return startUtc < apptEndUtc && endUtc > apptStartUtc;
      });
      if (overlaps) continue;

      slots.push(minutesToHHMM(m));
    }
  }

  // de-dup + sort
  const unique = Array.from(new Set(slots)).sort((a, b) => a.localeCompare(b));
  return res.status(200).json({ ok: true, timezone, slots: unique });
}

