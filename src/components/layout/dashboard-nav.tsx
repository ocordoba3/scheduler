"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Calendar, Clock, Settings, LogOut, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCalendarSettings } from "@/hooks/use-scheduler";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Calendario", icon: Calendar },
  { href: "/dashboard/availability", label: "Disponibilidad", icon: Clock },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: settings } = useCalendarSettings();

  const copyBookingLink = () => {
    if (!settings?.bookingUrl) return;
    const url = `${window.location.origin}${settings.bookingUrl}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace de reserva copiado");
  };

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold">
            Scheduler
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyBookingLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copiar enlace
          </Button>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
