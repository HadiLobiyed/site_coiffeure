import type { GetServerSideProps } from "next";
import { Layout } from "../../components/Layout";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { prisma } from "../../lib/prisma";
import { BARBER_COOKIE_NAME, verifyBarberSession } from "../../lib/auth";

type AppointmentItem = {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  persons: number;
  address: string;
  date: string;
};

type Props = {
  nextAppointment: AppointmentItem | null;
  appointments: AppointmentItem[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
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

  const now = new Date();
  const appts = await prisma.appointment.findMany({
    where: { barberId: session.barberId },
    orderBy: { date: "asc" },
  });

  const items: AppointmentItem[] = appts.map((a) => ({
    id: a.id,
    name: a.name,
    lastname: a.lastname,
    phone: a.phone,
    persons: a.persons,
    address: a.address,
    date: a.date.toISOString(),
  }));

  const nextAppointment = items.find((a) => new Date(a.date) >= now) ?? null;

  return {
    props: {
      nextAppointment,
      appointments: items,
    },
  };
};

export default function BarberDashboardPage({ nextAppointment, appointments }: Props) {
  return (
    <Layout variant="barber">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h1 className="text-xl font-semibold tracking-tight">Prochain RDV</h1>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="space-y-2">
                <p className="font-medium">
                  {nextAppointment.name} {nextAppointment.lastname}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(nextAppointment.date).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {nextAppointment.phone} • {nextAppointment.persons} pers.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {nextAppointment.address}
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Aucun rendez-vous à venir.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">
              Tous les rendez-vous
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Triés par date.
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-200/70 overflow-hidden rounded-xl border border-zinc-200/70 dark:divide-zinc-800 dark:border-zinc-800">
              {appointments.length ? (
                appointments.map((a) => (
                  <div key={a.id} className="grid gap-1 p-4 sm:grid-cols-2">
                    <div>
                      <p className="font-medium">
                        {a.name} {a.lastname}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {a.phone} • {a.persons} pers.
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm font-medium">
                        {new Date(a.date).toLocaleString()}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {a.address}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Aucun rendez-vous.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

