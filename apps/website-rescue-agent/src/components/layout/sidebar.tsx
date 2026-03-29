"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  FileText,
  ScrollText,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Outreach", href: "/outreach", icon: Send },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Logs", href: "/logs", icon: ScrollText },
  { name: "Einstellungen", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col bg-zinc-950 border-r border-zinc-800/60">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/60 px-4" suppressHydrationWarning>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white" suppressHydrationWarning>
          <IconWrapper icon={Zap} className="h-4 w-4 text-zinc-900" />
        </div>
        <div className="leading-tight" suppressHydrationWarning>
          <p className="text-sm font-semibold text-white">Rescue Agent</p>
          <p className="text-xs text-zinc-600">Lucello Studio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <IconWrapper icon={item.icon} className={cn("h-4 w-4 flex-shrink-0", active ? "text-white" : "text-zinc-600")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800/60 p-4" suppressHydrationWarning>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" suppressHydrationWarning />
          <p className="text-xs text-zinc-600">Kein Versand ohne Freigabe</p>
        </div>
      </div>
    </aside>
  );
}
