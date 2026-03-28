"use client";

import { signOut } from "next-auth/react";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { LogOut } from "lucide-react";
import type { Session } from "next-auth";

interface HeaderProps {
  user: Session["user"];
}

export function Header({ user }: HeaderProps) {
  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800/60 bg-zinc-950 px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
            {initials}
          </div>
          <span className="text-sm font-medium text-zinc-400">{user?.name}</span>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <IconWrapper icon={LogOut} className="h-3.5 w-3.5" />
          Abmelden
        </button>
      </div>
    </header>
  );
}
