import { useRouter } from "next/router";
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { ErrorText, Input, Label } from "../../components/ui/Field";

type ApiOk = { ok: true };
type ApiErr = { ok: false; error: string };

export default function BarberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/barber/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || !data.ok) {
        setError((data as ApiErr).error ?? "Erreur de connexion");
        return;
      }
      await router.push("/barber/dashboard");
    } catch {
      setError("Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout variant="client">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold tracking-tight">
              Connexion coiffeur
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Accédez au dashboard et aux disponibilités.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domaine.com"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button
                isLoading={loading}
                onClick={submit}
                type="button"
                disabled={!email || !password}
                className="w-full"
              >
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

