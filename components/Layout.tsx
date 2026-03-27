import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import { Button } from "./ui/Button";
import { SocialLink } from "./SocialIcons";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Layout({
  children,
  variant = "client",
}: PropsWithChildren<{ variant?: "client" | "barber" }>) {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/barber/logout", { method: "POST" });
    } finally {
      await router.push("/barber/login");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
          <Link href="/" className="font-semibold tracking-tight">
            <span className="sm:hidden">Coiffeur</span>
            <span className="hidden sm:inline">Coiffeur à domicile</span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center justify-end gap-1 text-sm sm:flex-none sm:gap-3">
            {variant === "client" ? (
              <>
                <Link
                  href="/reservation"
                  className={cx(
                    "rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 sm:px-3",
                  )}
                >
                  Réserver
                </Link>
                <Link
                  href="/barber/login"
                  className={cx(
                    "rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 sm:px-3",
                  )}
                >
                  Espace coiffeur
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/barber/dashboard"
                  className="rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 sm:px-3"
                >
                  Dashboard
                </Link>
                <Link
                  href="/barber/availability"
                  className="rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 sm:px-3"
                >
                  Disponibilités
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={logout}
                >
                  Déconnecter
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-zinc-200/70 py-10 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              Coiffeur à domicile
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} • Prise de rendez-vous en ligne
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <SocialLink href="https://facebook.com" title="Facebook" icon="facebook" />
            <SocialLink
              href="https://instagram.com"
              title="Instagram"
              icon="instagram"
            />
            <SocialLink href="https://tiktok.com" title="TikTok" icon="tiktok" />
          </div>
        </div>
      </footer>
    </div>
  );
}

