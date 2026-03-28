"use client";

import * as LucideIcons from "lucide-react";
import { IconWrapper } from "./icon-wrapper";

// Dynamischer Icon-Import für Client Components
// Verwendung: <ClientIcon name="Zap" className="h-4 w-4" />
type IconName = keyof typeof LucideIcons;

interface ClientIconProps {
  name: IconName;
  className?: string;
}

export function ClientIcon({ name, className }: ClientIconProps) {
  const Icon = LucideIcons[name] as React.ElementType;
  if (!Icon) return null;
  return <IconWrapper icon={Icon} className={className} />;
}

// Vorkonfigurierte Icons für häufige Fälle
export function IconZap({ className }: { className?: string }) {
  return <ClientIcon name="Zap" className={className} />;
}

export function IconUsers({ className }: { className?: string }) {
  return <ClientIcon name="Users" className={className} />;
}

export function IconTrendingUp({ className }: { className?: string }) {
  return <ClientIcon name="TrendingUp" className={className} />;
}

export function IconGlobe({ className }: { className?: string }) {
  return <ClientIcon name="Globe" className={className} />;
}

export function IconSend({ className }: { className?: string }) {
  return <ClientIcon name="Send" className={className} />;
}

export function IconPlus({ className }: { className?: string }) {
  return <ClientIcon name="Plus" className={className} />;
}

export function IconSearch({ className }: { className?: string }) {
  return <ClientIcon name="Search" className={className} />;
}

export function IconArrowRight({ className }: { className?: string }) {
  return <ClientIcon name="ArrowRight" className={className} />;
}

export function IconPlay({ className }: { className?: string }) {
  return <ClientIcon name="Play" className={className} />;
}

export function IconSparkles({ className }: { className?: string }) {
  return <ClientIcon name="Sparkles" className={className} />;
}

export function IconLayoutTemplate({ className }: { className?: string }) {
  return <ClientIcon name="LayoutTemplate" className={className} />;
}

export function IconInbox({ className }: { className?: string }) {
  return <ClientIcon name="Inbox" className={className} />;
}

export function IconBuilding2({ className }: { className?: string }) {
  return <ClientIcon name="Building2" className={className} />;
}

export function IconCheckCircle({ className }: { className?: string }) {
  return <ClientIcon name="CheckCircle" className={className} />;
}

export function IconAlertTriangle({ className }: { className?: string }) {
  return <ClientIcon name="AlertTriangle" className={className} />;
}

export function IconClock({ className }: { className?: string }) {
  return <ClientIcon name="Clock" className={className} />;
}

export function IconTarget({ className }: { className?: string }) {
  return <ClientIcon name="Target" className={className} />;
}

export function IconSlidersHorizontal({ className }: { className?: string }) {
  return <ClientIcon name="SlidersHorizontal" className={className} />;
}

export function IconBarChart2({ className }: { className?: string }) {
  return <ClientIcon name="BarChart2" className={className} />;
}

export function IconLogOut({ className }: { className?: string }) {
  return <ClientIcon name="LogOut" className={className} />;
}
