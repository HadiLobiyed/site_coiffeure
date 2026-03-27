import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { ErrorText, HelperText, Input, Label } from "../../components/ui/Field";
import { BARBER_COOKIE_NAME, verifyBarberSession } from "../../lib/auth";

type Availability = {
  id: string;
  day: number; // 1..7
  startHour: string;
  endHour: string;
};

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };

const dayLabels: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${BARBER_COOKIE_NAME}=`))
    ?.slice(BARBER_COOKIE_NAME.length + 1);

  const session = token ? verifyBarberSession(decodeURIComponent(token)) : null;
  if (!session) {
    return {
      redirect: { destination: "/barber/login", permanent: false },
    };
  }
  return { props: {} };
};

export default function AvailabilityPage() {
  const [items, setItems] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    day: "1",
    startHour: "09:00",
    endHour: "18:00",
  });

  const grouped = useMemo(() => {
    const map = new Map<number, Availability[]>();
    for (const it of items) {
      const arr = map.get(it.day) ?? [];
      arr.push(it);
      map.set(it.day, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.startHour.localeCompare(b.startHour));
      map.set(k, arr);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [items]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/availability");
      const data = (await res.json()) as ApiOk<Availability[]> | ApiErr;
      if (!res.ok || !data.ok) {
        setError((data as ApiErr).error ?? "Erreur");
        return;
      }
      setItems((data as ApiOk<Availability[]>).data);
    } catch {
      setError("Impossible de charger les disponibilités.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function create() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: Number(form.day),
          startHour: form.startHour,
          endHour: form.endHour,
        }),
      });
      const data = (await res.json()) as ApiOk<Availability> | ApiErr;
      if (!res.ok || !data.ok) {
        setError((data as ApiErr).error ?? "Erreur");
        return;
      }
      await refresh();
    } catch {
      setError("Impossible d’enregistrer.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as ApiOk<true> | ApiErr;
      if (!res.ok || !data.ok) {
        setError((data as ApiErr).error ?? "Erreur");
        return;
      }
      await refresh();
    } catch {
      setError("Impossible de supprimer.");
    } finally {
      setSaving(false);
    }
  }

  async function update(it: Availability) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(it),
      });
      const data = (await res.json()) as ApiOk<Availability> | ApiErr;
      if (!res.ok || !data.ok) {
        setError((data as ApiErr).error ?? "Erreur");
        return;
      }
      await refresh();
    } catch {
      setError("Impossible de modifier.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout variant="barber">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h1 className="text-xl font-semibold tracking-tight">Disponibilités</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Définissez les jours et horaires de travail.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jour</Label>
                <select
                  value={form.day}
                  onChange={(e) => setForm((s) => ({ ...s, day: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-200 dark:focus:ring-zinc-200/10"
                >
                  {Object.entries(dayLabels).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Début</Label>
                  <Input
                    type="time"
                    value={form.startHour}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, startHour: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin</Label>
                  <Input
                    type="time"
                    value={form.endHour}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, endHour: e.target.value }))
                    }
                  />
                </div>
              </div>
              <HelperText>Heure de fin exclusive (ex: fin 18:00).</HelperText>
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button isLoading={saving} onClick={create} type="button" className="w-full">
                Ajouter
              </Button>
              <Button
                variant="secondary"
                onClick={refresh}
                type="button"
                className="w-full"
                isLoading={loading}
              >
                Rafraîchir
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Liste</h2>
          </CardHeader>
          <CardContent>
            {grouped.length ? (
              <div className="space-y-6">
                {grouped.map(([day, arr]) => (
                  <div key={day} className="space-y-3">
                    <p className="font-medium">{dayLabels[day] ?? `Jour ${day}`}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {arr.map((it) => (
                        <div
                          key={it.id}
                          className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="time"
                                  value={it.startHour}
                                  onChange={(e) =>
                                    setItems((s) =>
                                      s.map((x) =>
                                        x.id === it.id
                                          ? { ...x, startHour: e.target.value }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                                <Input
                                  type="time"
                                  value={it.endHour}
                                  onChange={(e) =>
                                    setItems((s) =>
                                      s.map((x) =>
                                        x.id === it.id
                                          ? { ...x, endHour: e.target.value }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  type="button"
                                  onClick={() => update(it)}
                                  disabled={saving}
                                >
                                  Modifier
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  type="button"
                                  onClick={() => remove(it.id)}
                                  disabled={saving}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Aucune disponibilité.
                </p>
                {loading ? <HelperText>Chargement…</HelperText> : null}
                {error ? <ErrorText>{error}</ErrorText> : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

