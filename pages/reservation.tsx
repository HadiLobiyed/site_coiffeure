import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { ErrorText, HelperText, Input, Label, Textarea } from "../components/ui/Field";

type ApiOk = { ok: true; appointmentId: string };
type ApiErr = { ok: false; error: string };

export default function ReservationPage() {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    persons: "1",
    address: "",
    day: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [result, setResult] = useState<ApiOk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsTz, setSlotsTz] = useState<string>("Africa/Algiers");

  const minDay = useMemo(() => {
    const now = new Date(); // for input min only
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const durationHours = useMemo(() => {
    const p = Number(form.persons);
    if (!Number.isFinite(p) || p < 1) return 2;
    return 2 * Math.floor(p);
  }, [form.persons]);

  useEffect(() => {
    async function loadSlots() {
      setSlots([]);
      setForm((s) => ({ ...s, time: "" }));
      const day = form.day;
      const persons = Number(form.persons);
      if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
      if (!Number.isFinite(persons) || persons < 1) return;

      setLoadingSlots(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/slots?date=${encodeURIComponent(day)}&persons=${encodeURIComponent(
            String(Math.floor(persons)),
          )}`,
        );
        const data = (await res.json()) as
          | { ok: true; timezone: string; slots: string[] }
          | ApiErr;
        if (!res.ok || !("ok" in data) || !data.ok) {
          setError((data as ApiErr).error ?? "Erreur lors du chargement des créneaux");
          return;
        }
        setSlotsTz(data.timezone);
        setSlots(data.slots);
      } catch {
        setError("Impossible de charger les créneaux.");
      } finally {
        setLoadingSlots(false);
      }
    }

    void loadSlots();
  }, [form.day, form.persons]);

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const persons = Number(form.persons);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          lastname: form.lastname,
          phone: form.phone,
          persons,
          address: form.address,
          // Send day+time in barber timezone to avoid browser timezone issues.
          day: form.day,
          time: form.time,
        }),
      });
      const data = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || !data.ok) {
        setError((data as ApiErr).error ?? "Erreur inconnue");
        return;
      }
      setResult(data as ApiOk);
      setForm({
        name: "",
        lastname: "",
        phone: "",
        persons: "1",
        address: "",
        day: "",
        time: "",
      });
      setSlots([]);
    } catch {
      setError("Impossible d’envoyer la réservation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout variant="client">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Réservation</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Choisissez une date (calendrier), puis un créneau disponible.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Votre nom"
                />
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={form.lastname}
                  onChange={(e) => setForm((s) => ({ ...s, lastname: e.target.value }))}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="06..."
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de personnes</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.persons}
                  onChange={(e) => setForm((s) => ({ ...s, persons: e.target.value }))}
                />
                <HelperText>Durée: {durationHours}h (2h × personnes)</HelperText>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Adresse</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                  placeholder="Adresse complète"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.day}
                  min={minDay}
                  onChange={(e) => setForm((s) => ({ ...s, day: e.target.value }))}
                />
                <HelperText>Fuseau horaire: {slotsTz}</HelperText>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Heure (créneaux disponibles)</Label>
                {loadingSlots ? (
                  <HelperText>Chargement des créneaux…</HelperText>
                ) : slots.length ? (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((s) => ({ ...s, time: t }))}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition",
                          form.time === t
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/40",
                        ].join(" ")}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : form.day ? (
                  <HelperText>Aucun créneau disponible ce jour.</HelperText>
                ) : (
                  <HelperText>Sélectionne d’abord une date.</HelperText>
                )}
              </div>
            </div>

            {error ? <div className="mt-4"><ErrorText>{error}</ErrorText></div> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                isLoading={loading}
                onClick={submit}
                type="button"
                className="w-full sm:w-auto"
                disabled={
                  !form.name ||
                  !form.lastname ||
                  !form.phone ||
                  !form.address ||
                  !form.day ||
                  !form.time
                }
              >
                Confirmer
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => {
                  setError(null);
                  setResult(null);
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold tracking-tight">Confirmation</h3>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-2">
                <p className="font-medium">Votre rendez-vous est confirmé.</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Référence: <span className="font-mono">{result.appointmentId}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Une fois validé, vous verrez ici un message de confirmation.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

