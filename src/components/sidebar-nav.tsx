"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  FileStack,
  Settings,
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
    icon: CalendarDays,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: FileStack,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: CalendarClock,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1 px-4">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium ${
              active
                ? "translate-x-1 bg-secondary text-primary"
                : "text-muted hover:bg-surface-soft hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
