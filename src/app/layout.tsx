import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "@/app/globals.css";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Scheduler — Agenda y reservas",
  description:
    "Plataforma de agendamiento con calendario, disponibilidad y reservas públicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${robotoCondensed.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
