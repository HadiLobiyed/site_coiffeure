import { DateTime } from "luxon";

export function parseTimeToMinutes(hhmm: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h * 60 + min;
}

export function getIsoInZone(iso: string, timezone: string): DateTime | null {
  const dt = DateTime.fromISO(iso, { zone: timezone });
  if (!dt.isValid) return null;
  return dt;
}

export function isWithinAvailability(params: {
  appointmentInZone: DateTime;
  appointmentEndInZone?: DateTime;
  startHour: string;
  endHour: string;
}) {
  const { appointmentInZone, appointmentEndInZone, startHour, endHour } = params;
  const startMin = parseTimeToMinutes(startHour);
  const endMin = parseTimeToMinutes(endHour);
  if (startMin === null || endMin === null) return false;

  const apptMin = appointmentInZone.hour * 60 + appointmentInZone.minute;
  const endDt = appointmentEndInZone ?? appointmentInZone;
  const apptEndMin = endDt.hour * 60 + endDt.minute;

  // Must be on same day, inclusive start, exclusive end
  if (!appointmentInZone.hasSame(endDt, "day")) return false;
  return apptMin >= startMin && apptEndMin <= endMin;
}

