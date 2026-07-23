"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { useSession } from "next-auth/react";

interface Props {
  children?: React.ReactNode;
}

const SchedulerHeader = ({ children }: Props) => {
  const { data: session, status } = useSession();
  const href = status === "authenticated" && session?.user ? "/dashboard" : "/";

  return (
    <header className="border-b">
      <div className="mx-0 md:mx-8 flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <Image
            className="hidden md:block w-10 h-10"
            src="/logo.png"
            alt="Scheduler logo"
            width={40}
            height={40}
          />
          <Link href={href} className="ml-0 md:ml-2 mr-4 text-lg font-semibold text-primary">
            Scheduler
          </Link>
        </div>
        {children}
      </div>
    </header>
  );
};

export default memo(SchedulerHeader);
