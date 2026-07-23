import Link from "next/link";
import { memo } from "react";

interface Props {
  children?: React.ReactNode;
}

const SchedulerHeader = ({ children }: Props) => {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Scheduler
        </Link>
        {children}
      </div>
    </header>
  );
};

export default memo(SchedulerHeader);
