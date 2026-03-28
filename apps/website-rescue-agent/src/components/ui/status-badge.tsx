import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/utils";
import type { LeadStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW:                    "bg-zinc-800 text-zinc-400 border-zinc-700",
  QUEUED_FOR_CRAWL:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CRAWLED:                "bg-blue-500/15 text-blue-400 border-blue-500/25",
  ANALYZED:               "bg-violet-500/10 text-violet-400 border-violet-500/20",
  QUALIFIED:              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DISQUALIFIED:           "bg-red-500/10 text-red-400 border-red-500/20",
  SITE_GENERATED:         "bg-teal-500/10 text-teal-400 border-teal-500/20",
  IN_REVIEW:              "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED_FOR_OUTREACH:  "bg-green-500/10 text-green-400 border-green-500/20",
  OUTREACH_DRAFT_READY:   "bg-green-500/15 text-green-400 border-green-500/25",
  SENT:                   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  RESPONDED:              "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  WON:                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-semibold",
  LOST:                   "bg-zinc-800 text-zinc-600 border-zinc-700",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-none",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
