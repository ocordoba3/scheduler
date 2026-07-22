import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Link2, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">Scheduler</span>
          <div className="flex gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Iniciar sesión
            </Link>
            <Link href="/register" className={cn(buttonVariants())}>
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Agenda eventos sin complicaciones
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Crea tu calendario, define tu disponibilidad y comparte un enlace
            para que cualquiera pueda reservar — sin necesidad de que se registren.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Empezar gratis
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Ver mi calendario
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Calendar,
                title: "Vista completa",
                desc: "Mes, semana y día con CRUD de eventos",
              },
              {
                icon: Link2,
                title: "Enlace público",
                desc: "Comparte /book/[id] sin login para visitantes",
              },
              {
                icon: Clock,
                title: "Slots configurables",
                desc: "Define rangos de disponibilidad y duración",
              },
              {
                icon: Shield,
                title: "Pagos (pronto)",
                desc: "Placeholder listo para depósito o pago total",
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-2 text-center">
                <feature.icon className="mx-auto h-8 w-8 text-primary" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
