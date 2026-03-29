"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ConversationStatus, ACTIVE_CONVERSATION_STATUSES } from "@/types";
import { Loader2, Send, AlertCircle, CheckCircle, XCircle, ArchiveX } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface FollowUpButtonProps {
  conversationStatus: ConversationStatus;
  followUpCount: number;
  maxFollowUps?: number;
  onCreateFollowUp: () => Promise<void>;
  className?: string;
  showLabel?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUARD LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

interface GuardResult {
  allowed: boolean;
  reason: string;
  icon: React.ReactNode;
  severity: "info" | "warning" | "error";
}

function checkFollowUpGuards(
  status: ConversationStatus,
  count: number,
  max: number
): GuardResult {
  // Guard 1: Conversation geschlossen?
  if (!ACTIVE_CONVERSATION_STATUSES.includes(status)) {
    const isWon = status === ConversationStatus.CLOSED_WON;
    const isLost = status === ConversationStatus.CLOSED_LOST;
    const isNoReply = status === ConversationStatus.NO_REPLY_CLOSED;
    
    return {
      allowed: false,
      reason: isWon 
        ? "Conversation bereits gewonnen"
        : isLost
        ? "Conversation bereits verloren"
        : isNoReply
        ? "Keine Antwort nach 3 Follow-ups"
        : "Conversation geschlossen",
      icon: isWon ? <CheckCircle className="h-4 w-4" /> : 
            isNoReply ? <ArchiveX className="h-4 w-4" /> : 
            <XCircle className="h-4 w-4" />,
      severity: "info",
    };
  }

  // Guard 2: Max Follow-ups erreicht?
  if (count >= max) {
    return {
      allowed: false,
      reason: `Maximum von ${max} Follow-ups erreicht`,
      icon: <AlertCircle className="h-4 w-4" />,
      severity: "warning",
    };
  }

  // Guard 3: Letztes Follow-up?
  if (count === max - 1) {
    return {
      allowed: true,
      reason: `Letztes Follow-up (${count + 1}/${max})`,
      icon: <AlertCircle className="h-4 w-4" />,
      severity: "warning",
    };
  }

  // Alles okay
  return {
    allowed: true,
    reason: `Follow-up ${count + 1} von ${max}`,
    icon: <Send className="h-4 w-4" />,
    severity: "info",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function FollowUpButton({
  conversationStatus,
  followUpCount,
  maxFollowUps = 3,
  onCreateFollowUp,
  className,
  showLabel = true,
}: FollowUpButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const guard = checkFollowUpGuards(conversationStatus, followUpCount, maxFollowUps);

  const handleClick = async () => {
    if (!guard.allowed || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      await onCreateFollowUp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up konnte nicht erstellt werden");
    } finally {
      setIsLoading(false);
    }
  };

  // Button Styles basierend auf State
  const getButtonStyles = () => {
    if (!guard.allowed) {
      return "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-60";
    }
    if (guard.severity === "warning") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/40";
    }
    return "bg-sky-600 hover:bg-sky-500 text-white";
  };

  return (
    <div className="relative flex flex-col items-start gap-1">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded border border-zinc-700 whitespace-nowrap z-50">
          {guard.reason}
        </div>
      )}

      <button
        type="button"
        disabled={!guard.allowed || isLoading}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium border transition-colors",
          getButtonStyles(),
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {guard.icon}
            {showLabel && (
              <span className="ml-1.5">
                {followUpCount === 0 ? "Follow-up" : `Follow-up ${followUpCount + 1}`}
              </span>
            )}
          </>
        )}
      </button>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
