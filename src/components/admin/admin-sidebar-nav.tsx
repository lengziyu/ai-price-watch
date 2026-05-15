"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DatabaseIcon,
  FileClockIcon,
  FileTextIcon,
  FilePenLineIcon,
  RadarIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: "radar" | "refresh" | "shield" | "pen" | "database" | "logs" | "article";
};

const iconMap = {
  radar: RadarIcon,
  refresh: RefreshCcwIcon,
  shield: ShieldCheckIcon,
  pen: FilePenLineIcon,
  database: DatabaseIcon,
  logs: FileClockIcon,
  article: FileTextIcon,
} as const;

export function AdminSidebarNav({
  items,
  onNavigate,
}: {
  items: AdminNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={isActive}
            className="admin-nav-link"
            onClick={onNavigate}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
