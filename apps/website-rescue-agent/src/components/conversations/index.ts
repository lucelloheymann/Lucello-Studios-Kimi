/**
 * Conversation Components
 * 
 * Wiederverwendbare Komponenten für das Conversation / Follow-up / Reply Management.
 * 
 * @example
 * ```tsx
 * import { 
 *   ConversationStatusBadge, 
 *   ReplyForm, 
 *   FollowUpButton,
 *   ConversationTimeline 
 * } from "@/components/conversations";
 * ```
 */

// Status Badges
export {
  ConversationStatusBadge,
  ReplySentimentBadge,
  FollowUpCounter,
} from "./conversation-status";

// Forms
export {
  ReplyForm,
  type ReplyFormData,
} from "./reply-form";

// Actions
export {
  FollowUpButton,
} from "./follow-up-button";

// Timeline
export {
  ConversationTimeline,
  CompactTimeline,
  type TimelineEvent,
  type TimelineEventType,
} from "./conversation-timeline";
