"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Icon-Wrapper verhindert Hydration-Mismatch durch Browser-Extensions (Dark Reader)
// Diese fügen Attribute wie data-darkreader-inline-stroke hinzu, die auf dem Server fehlen
interface IconWrapperProps {
  icon: React.ElementType;
  className?: string;
}

export function IconWrapper({ icon: Icon, className }: IconWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className={cn("inline-block", className)}
        style={{ width: 16, height: 16 }}
      />
    );
  }

  return <Icon className={className} />;
}

// Lazy-Icon rendert das Icon erst nach der Hydration
// Verwendung: Für Icons die Probleme mit Dark Reader verursachen
export function LazyIcon({ icon: Icon, className }: IconWrapperProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verzögertes Anzeigen nach Hydration
    const timer = setTimeout(() => setShow(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return (
      <span
        className={cn("inline-block", className)}
        style={{ width: 16, height: 16 }}
      />
    );
  }

  return <Icon className={className} />;
}
