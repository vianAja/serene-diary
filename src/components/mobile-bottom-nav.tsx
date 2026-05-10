"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCheck,
  CalendarRange,
  ChartColumn,
  FileStack,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Daily",
    icon: BookCheck,
  },
  {
    href: "/reports/weekly",
    label: "Weekly",
    icon: CalendarRange,
  },
  {
    href: "/reports/monthly",
    label: "Monthly",
    icon: ChartColumn,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: FileStack,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around rounded-t-[20px] border-t border-outline/30 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(137,168,178,0.08)] md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex min-w-[72px] flex-col items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              active
                ? "bg-secondary text-primary"
                : "text-muted hover:bg-surface-soft hover:text-primary"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "stroke-[2.3]" : ""}`} />
            <span className="mt-1">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
