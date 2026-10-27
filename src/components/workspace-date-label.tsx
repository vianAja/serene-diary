"use client";

import { usePathname } from "next/navigation";

export function WorkspaceDateLabel({ dateLabel }: { dateLabel: string }) {
  const pathname = usePathname();

  if (pathname === "/tahlil") {
    return null;
  }

  return (
    <div className="mb-8 hidden md:block">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Today
      </p>
      <p className="mt-1 text-[18px] font-semibold text-primary">{dateLabel}</p>
    </div>
  );
}
