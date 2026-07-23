import SchedulerHeader from "@/components/layout/scheduler-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SchedulerHeader />
      {children}
    </>
  );
}
