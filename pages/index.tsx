import Link from "next/link";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Image from "next/image";

export default function HomePage() {
  return (
    <Layout variant="client">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative grid min-h-[420px] sm:min-h-[520px] lg:grid-cols-2">
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Salon de coiffure"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
              <p className="inline-flex w-fit items-center rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                Ambiance salon • Coupe • Barbe • Style
              </p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Une expérience de coiffure premium.
              </h1>
              <p className="mt-3 max-w-prose text-pretty text-lg text-white/80">
                Plongez dans une ambiance salon… et réservez facilement votre créneau.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/reservation">
                  <Button size="lg" className="w-full sm:w-auto">
                    Réserver
                  </Button>
                </Link>
                <a href="#galerie">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Voir les coupes
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Professionnel, précis, moderne.
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Des coupes nettes, des contours propres, et un style adapté à votre visage.
                Réservation en ligne avec créneaux disponibles.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Créneaux", v: "Affichés automatiquement" },
                  { k: "Durée", v: "2h × personnes" },
                  { k: "Fiable", v: "Anti-chevauchement" },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl border border-zinc-200/70 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/20"
                  >
                    <p className="text-sm font-medium">{x.k}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {x.v}
                    </p>
                  </div>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <p className="text-sm font-medium">Comment ça marche</p>
                </CardHeader>
                <CardContent>
                  <ol className="grid gap-3 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
                    <li className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">1. Date</p>
                      <p className="mt-1">Choisissez une date (calendrier).</p>
                    </li>
                    <li className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">2. Créneau</p>
                      <p className="mt-1">Sélectionnez une heure disponible.</p>
                    </li>
                    <li className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">3. Confirmé</p>
                      <p className="mt-1">Votre plage horaire est réservée.</p>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="galerie" className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Galerie coupes</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Quelques inspirations (photos libres de droits).
            </p>
          </div>
          <Link href="/reservation" className="hidden sm:block">
            <Button variant="secondary">Réserver</Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1635273051839-003bf06a8751?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
            "https://plus.unsplash.com/premium_photo-1677098576397-d3403bf838a0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          ].map((src, idx) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-zinc-200/70 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30"
            >
              <Image
                src={src}
                alt={`Coupe ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Services</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Pour 1 personne ou plusieurs (la plage horaire se bloque automatiquement).
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Coupe + finition",
                  desc: "Selon votre style, avec finition propre.",
                },
                {
                  title: "Barbe",
                  desc: "Taille, contours et conseils entretien.",
                },
                {
                  title: "Enfants",
                  desc: "Coupe adaptée, ambiance calme.",
                },
                {
                  title: "Groupe / famille",
                  desc: "Bloquez un créneau plus long via “personnes”.",
                },
              ].map((x) => (
                <div
                  key={x.title}
                  className="rounded-2xl border border-zinc-200/70 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/20"
                >
                  <p className="font-medium">{x.title}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {x.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold tracking-tight">Réserver maintenant</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Choisissez une date/heure (fuseau Algérie). Le créneau est réservé sur
              la durée \(2h × personnes\).
            </p>
            <div className="mt-4">
              <Link href="/reservation">
                <Button className="w-full" size="lg">
                  Aller à la réservation
                </Button>
              </Link>
            </div>
            <div className="mt-3">
              <Link href="/barber/login">
                <Button className="w-full" variant="secondary">
                  Espace coiffeur
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}

