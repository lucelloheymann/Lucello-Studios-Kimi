"use client";

import { cn } from "@/lib/utils";
import { ConversationStatus, ReplySentiment } from "@/types";
import { 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  XCircle, 
  ArchiveX,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ShieldAlert
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATION STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════════

interface ConversationStatusBadgeProps {
  status: ConversationStatus;
  followUpCount?: number;
  className?: string;
  showIcon?: boolean;
}

const CONVERSATION_STATUS_CONFIG: Record<ConversationStatus, {
  label: string;
  icon: React.ReactNode;
  style: string;
}> = {
  [ConversationStatus.PENDING]: {
    label: "Ausstehend",
    icon: <Clock className="h-3 w-3" />,
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  [ConversationStatus.REPLIED]: {
    label: "Antwort erhalten",
    icon: <MessageCircle className="h-3 w-3" />,
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  [ConversationStatus.FOLLOW_UP_SENT]: {
    label: "Follow-up versendet",
    icon: <Send className="h-3 w-3" />,
    style: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  [ConversationStatus.CLOSED_WON]: {
    label: "Gewonnen",
    icon: <CheckCircle className="h-3 w-3" />,
    style: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-medium",
  },
  [ConversationStatus.CLOSED_LOST]: {
    label: "Verloren",
    icon: <XCircle className="h-3 w-3" />,
    style: "bg-zinc-800 text-zinc-500 border-zinc-700",
  },
  [ConversationStatus.NO_REPLY_CLOSED]: {
    label: "Keine Antwort",
    icon: <ArchiveX className="h-3 w-3" />,
    style: "bg-zinc-800 text-zinc-500 border-zinc-700",
  },
};

export function ConversationStatusBadge({
  status,
  followUpCount,
  className,
  showIcon = true,
}: ConversationStatusBadgeProps) {
  const config = CONVERSATION_STATUS_CONFIG[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs leading-none",
        config.style,
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      {followUpCount !== undefined && followUpCount > 0 && (
        <span className="ml-1 text-[10px] opacity-70">({followUpCount})</span>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPLY SENTIMENT BADGE
// ═══════════════════════════════════════════════════════════════════════════════

interface ReplySentimentBadgeProps {
  sentiment: ReplySentiment;
  className?: string;
  showIcon?: boolean;
}

const SENTIMENT_CONFIG: Record<ReplySentiment, {
  label: string;
  icon: React.ReactNode;
  style: string;
}> = {
  [ReplySentiment.POSITIVE]: {
    label: "Positiv",
    icon: <ThumbsUp className="h-3 w-3" />,
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  [ReplySentiment.NEUTRAL]: {
    label: "Neutral",
    icon: <Minus className="h-3 w-3" />,
    style: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
  [ReplySentiment.NEGATIVE]: {
    label: "Negativ",
    icon: <ThumbsDown className="h-3 w-3" />,
    style: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  [ReplySentiment.SPAM]: {
    label: "Spam",
    icon: <ShieldAlert className="h-3 w-3" />,
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

export function ReplySentimentBadge({
  sentiment,
  className,
  showIcon = true,
}: ReplySentimentBadgeProps) {
  const config = SENTIMENT_CONFIG[sentiment];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs leading-none",
        config.style,
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOLLOW-UP COUNTER (visuelle Anzeige der verbleibenden Follow-ups)
// ═══════════════════════════════════════════════════════════════════════════════

interface FollowUpCounterProps {
  current: number; // bereits gesendet
  max?: number;
  className?: string;
}

export function FollowUpCounter({
  current,
  max = 3,
  className,
}: FollowUpCounterProps) {
  const remaining = Math.max(0, max - current);
  const isMaxReached = current >= max;
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        isMaxReached ? "text-zinc-600" : "text-zinc-400",
        className
      )}
    >
      <span className="tabular-nums">{current}/{max}</span>
      <span className="text-zinc-600">Follow-ups</span>
      {isMaxReached && (
        <span className="text-[10px] text-amber-500/70">(Limit)</span>
      )}
    </div>
  );
}
